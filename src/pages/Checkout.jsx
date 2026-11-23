import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { calcShipping, deliverySettings } from "../lib/delivery.js";

const initialForm = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  note: "",
};

const formatMoney = (amount) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const createOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `IMP-${timestamp}-${random}`;
};

const normalizePhone = (value) => {
  let phone = String(value || "").replace(/\D/g, "");

  if (phone.startsWith("00880")) {
    phone = "0" + phone.slice(5);
  } else if (phone.startsWith("880")) {
    phone = "0" + phone.slice(3);
  }

  return phone;
};

const getItemImage = (item) => {
  if (typeof item.image === "string" && item.image) {
    return item.image;
  }

  if (Array.isArray(item.images) && item.images.length) {
    return item.images[0];
  }

  return item.product?.images?.[0] || "";
};

export default function Checkout() {
  const navigate = useNavigate();

  const {
    loading: storeLoading,
    cart = [],
    customer,
    settings = {},
    clearCart,
    placeOrder,
  } = useStore();

  const [form, setForm] = useState(() => ({
    ...initialForm,
    customer_name: customer?.name || "",
    customer_phone: customer?.phone || "",
  }));

  const [deliveryZone, setDeliveryZone] = useState("inside");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Admin settings
  const checkoutSettings = settings?.checkout || {};

  // ডিফল্ট মান এক জায়গা থেকেই আসে (lib/delivery.js)
  const { inside: deliveryInside, outside: deliveryOutside } =
    deliverySettings(checkoutSettings);

  const codEnabled = checkoutSettings.codEnabled !== false;

  // Cart subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 0);

      return sum + price * qty;
    }, 0);
  }, [cart]);

  // Shipping calculation — এক জায়গার হিসাব (lib/delivery.js)
  const shipping = cart.length
    ? calcShipping(subtotal, checkoutSettings, {
        outside: deliveryZone === "outside",
      })
    : 0;

  const isFreeDelivery = cart.length > 0 && shipping === 0;

  const discount = 0;
  const total = subtotal + shipping - discount;

  // Form updates
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // Validation
  const validateForm = () => {
    if (!cart.length) {
      return "আপনার কার্ট খালি। আগে পণ্য যোগ করুন।";
    }

    if (!form.customer_name.trim()) {
      return "আপনার সম্পূর্ণ নাম লিখুন।";
    }

    const phone = normalizePhone(form.customer_phone);

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন।";
    }

    if (!form.customer_address.trim()) {
      return "আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।";
    }

    if (!codEnabled) {
      return "বর্তমানে Cash on Delivery বন্ধ রয়েছে।";
    }

    if (typeof placeOrder !== "function") {
      return "অর্ডার সিস্টেম পাওয়া যাচ্ছে না।";
    }

    for (const item of cart) {
      const price = Number(item.price);
      const qty = Number(item.qty);

      if (
        !item.id ||
        !item.name ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return "কার্টে একটি পণ্যের তথ্য সঠিক নেই।";
      }
    }

    return "";
  };

  // Place order
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const orderCode = createOrderCode();
      const phone = normalizePhone(form.customer_phone);

      const deliveryLabel =
        deliveryZone === "outside"
          ? "ঢাকার বাইরে"
          : "ঢাকার ভিতরে";

      const orderNote = [
        `ডেলিভারি এলাকা: ${deliveryLabel}`,
        form.note.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      // Database-compatible order object
      const orderData = {
        order_code: orderCode,

        customer_name: form.customer_name.trim(),

        customer_phone: phone,

        customer_address: form.customer_address.trim(),

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug || "",
          price: Number(item.price),
          qty: Number(item.qty),
          variant: item.variant || "",
          image: getItemImage(item),
        })),

        subtotal: Number(subtotal.toFixed(2)),

        shipping: Number(shipping.toFixed(2)),

        discount: Number(discount.toFixed(2)),

        coupon_code: "",

        total: Number(total.toFixed(2)),

        payment_method: paymentMethod,

        status: "new",

        note: orderNote,
      };

      // Supabase or localdb
      const savedOrder = await placeOrder(orderData);

      if (!savedOrder || !savedOrder.order_code) {
        throw new Error("অর্ডার সংরক্ষণ নিশ্চিত করা যায়নি।");
      }

      const finalOrderCode = savedOrder.order_code;

      // Clear cart only after successful save
      clearCart();

      // Navigate to success page
      navigate(
        `/order-success/${encodeURIComponent(finalOrderCode)}`,
        {
          replace: true,
          state: {
            order: {
              ...orderData,
              ...savedOrder,
              order_code: finalOrderCode,
            },
          },
        }
      );

    } catch (err) {
      console.error("IMPOTECH CHECKOUT ERROR:", err);

      setError(
        err?.message ||
          "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Store loading
  if (storeLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mx-auto mb-4" />

          <p className="text-gray-600">
            তথ্য লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart.length) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center">

        <div className="text-7xl mb-5">
          🛒
        </div>

        <h2 className="text-2xl font-bold mb-2">
          আপনার কার্ট খালি
        </h2>

        <p className="text-gray-500 mb-6">
          অর্ডার করতে প্রথমে আপনার পছন্দের পণ্য কার্টে যোগ করুন।
        </p>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="bg-black text-white px-7 py-3 rounded-xl font-semibold hover:bg-gray-800"
        >
          শপিং শুরু করুন
        </button>

      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">

      {/* Page Heading */}
      <div className="mb-8">

        <p className="text-sm text-gray-500 mb-2">
          IMPOTECH / CHECKOUT
        </p>

        <h1 className="text-3xl md:text-4xl font-bold">
          অর্ডার সম্পন্ন করুন
        </h1>

        <p className="text-gray-500 mt-2">
          আপনার তথ্য দিয়ে অর্ডার কনফার্ম করুন।
        </p>

      </div>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* LEFT: Customer Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer information */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7">

              <h2 className="text-xl font-bold mb-6">
                ১. ডেলিভারি তথ্য
              </h2>

              <div className="space-y-5">

                <div>
                  <label
                    htmlFor="customer_name"
                    className="block font-medium mb-2"
                  >
                    আপনার নাম *
                  </label>

                  <input
                    id="customer_name"
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="আপনার সম্পূর্ণ নাম"
                    autoComplete="name"
                    required
                    maxLength={100}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_phone"
                    className="block font-medium mb-2"
                  >
                    মোবাইল নম্বর *
                  </label>

                  <input
                    id="customer_phone"
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={14}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    অর্ডার ও ডেলিভারি আপডেটের জন্য এই নম্বরটি ব্যবহার করা হবে।
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="customer_address"
                    className="block font-medium mb-2"
                  >
                    সম্পূর্ণ ঠিকানা *
                  </label>

                  <textarea
                    id="customer_address"
                    name="customer_address"
                    value={form.customer_address}
                    onChange={handleChange}
                    placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা, থানা ও জেলার নাম লিখুন"
                    autoComplete="street-address"
                    rows={4}
                    maxLength={1000}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="note"
                    className="block font-medium mb-2"
                  >
                    অতিরিক্ত নির্দেশনা (ঐচ্ছিক)
                  </label>

                  <textarea
                    id="note"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="ডেলিভারি সম্পর্কে কোনো নির্দেশনা থাকলে লিখুন"
                    rows={3}
                    maxLength={1000}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                  />
                </div>

              </div>

            </section>

            {/* Delivery Area */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7">

              <h2 className="text-xl font-bold mb-5">
                ২. ডেলিভারি এলাকা
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <label
                  className={`border rounded-xl p-4 cursor-pointer transition ${
                    deliveryZone === "inside"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <input
                      type="radio"
                      name="deliveryZone"
                      value="inside"
                      checked={deliveryZone === "inside"}
                      onChange={(e) =>
                        setDeliveryZone(e.target.value)
                      }
                      className="w-5 h-5 accent-black"
                    />

                    <div>
                      <p className="font-semibold">
                        ঢাকার ভিতরে
                      </p>

                      <p className="text-sm text-gray-500">
                        {formatMoney(deliveryInside)}
                      </p>
                    </div>

                  </div>
                </label>

                <label
                  className={`border rounded-xl p-4 cursor-pointer transition ${
                    deliveryZone === "outside"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <input
                      type="radio"
                      name="deliveryZone"
                      value="outside"
                      checked={deliveryZone === "outside"}
                      onChange={(e) =>
                        setDeliveryZone(e.target.value)
                      }
                      className="w-5 h-5 accent-black"
                    />

                    <div>
                      <p className="font-semibold">
                        ঢাকার বাইরে
                      </p>

                      <p className="text-sm text-gray-500">
                        {formatMoney(deliveryOutside)}
                      </p>
                    </div>

                  </div>
                </label>

              </div>

              {isFreeDelivery && (
                <p className="text-green-700 text-sm mt-4 font-medium">
                  অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন।
                </p>
              )}

            </section>

            {/* Payment */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7">

              <h2 className="text-xl font-bold mb-5">
                ৩. পেমেন্ট পদ্ধতি
              </h2>

              {codEnabled ? (
                <label className="flex gap-4 items-center border border-black bg-gray-50 rounded-xl p-5 cursor-pointer">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="w-5 h-5 accent-black"
                  />

                  <div className="flex-1">

                    <p className="font-bold">
                      Cash on Delivery
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      পণ্য হাতে পাওয়ার পর টাকা পরিশোধ করুন।
                    </p>

                  </div>

                  <span className="text-2xl">
                    💵
                  </span>

                </label>
              ) : (
                <p className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">
                  বর্তমানে Cash on Delivery বন্ধ রয়েছে।
                </p>
              )}

            </section>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-1">

            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 lg:sticky lg:top-6">

              <h2 className="text-xl font-bold mb-6">
                আপনার অর্ডার
              </h2>

              {/* Cart Items */}
              <div className="space-y-5">

                {cart.map((item, index) => {
                  const image = getItemImage(item);
                  const price = Number(item.price || 0);
                  const qty = Number(item.qty || 0);

                  return (
                    <div
                      key={`${item.id}-${item.variant || index}`}
                      className="flex gap-3 items-center"
                    >

                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 border">

                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🏍️
                          </div>
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="font-semibold text-sm line-clamp-2">
                          {item.name}
                        </p>

                        {item.variant && (
                          <p className="text-xs text-gray-500 mt-1">
                            ভ্যারিয়েন্ট: {item.variant}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                          {formatMoney(price)} × {qty}
                        </p>

                      </div>

                      <p className="font-bold text-sm whitespace-nowrap">
                        {formatMoney(price * qty)}
                      </p>

                    </div>
                  );
                })}

              </div>

              <hr className="my-6" />

              {/* Price calculation */}
              <div className="space-y-4">

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    পণ্যের মূল্য
                  </span>

                  <span className="font-semibold">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    ডেলিভারি চার্জ
                  </span>

                  <span className="font-semibold">
                    {isFreeDelivery ? (
                      <span className="text-green-600">
                        ফ্রি
                      </span>
                    ) : (
                      formatMoney(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    ডিসকাউন্ট
                  </span>

                  <span className="text-green-600 font-semibold">
                    -{formatMoney(discount)}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between items-center gap-3 text-lg font-bold">
                  <span>
                    সর্বমোট
                  </span>

                  <span className="text-xl">
                    {formatMoney(total)}
                  </span>
                </div>

              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-5 text-sm"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !codEnabled}
                className="w-full mt-6 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition"
              >
                {submitting
                  ? "অর্ডার প্রসেস হচ্ছে..."
                  : "অর্ডার কনফার্ম করুন"}
              </button>

              <div className="mt-5 text-center space-y-2">

                <p className="text-xs text-gray-500">
                  🔒 আপনার তথ্য অর্ডার প্রসেসিংয়ের জন্য ব্যবহার করা হবে।
                </p>

                <p className="text-xs text-gray-500">
                  Cash on Delivery সুবিধা।
                </p>

              </div>

            </section>

          </div>

        </div>

      </form>

    </div>
  );
      }
