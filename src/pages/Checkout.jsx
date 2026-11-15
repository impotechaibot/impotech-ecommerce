
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const SHIPPING_CHARGE = 80;

const initialForm = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  note: "",
};

const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const createOrderCode = () => {
  const date = new Date();
  const datePart = date
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `IMP-${datePart}-${randomPart}`;
};

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cart = [],
    clearCart,
    placeOrder,
  } = useStore();

  const [form, setForm] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) * Number(item.qty || 1),
      0
    );
  }, [cart]);

  const shipping = cart.length > 0 ? SHIPPING_CHARGE : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = () => {
    if (!form.customer_name.trim()) {
      return "আপনার নাম লিখুন।";
    }

    const phone = form.customer_phone.replace(/\D/g, "");

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন।";
    }

    if (!form.customer_address.trim()) {
      return "সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।";
    }

    if (!cart.length) {
      return "আপনার কার্ট খালি। আগে পণ্য যোগ করুন।";
    }

    for (const item of cart) {
      if (
        !item.id ||
        !item.name ||
        Number(item.price) < 0 ||
        Number(item.qty) < 1
      ) {
        return "কার্টে একটি পণ্যের তথ্য সঠিক নেই।";
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (typeof placeOrder !== "function") {
      setError("অর্ডার সিস্টেম প্রস্তুত নয়। StoreContext পরীক্ষা করুন।");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderCode = createOrderCode();

      const orderData = {
        order_code: orderCode,

        customer_name: form.customer_name.trim(),

        customer_phone: form.customer_phone
          .replace(/\D/g, ""),

        customer_address: form.customer_address.trim(),

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug || "",
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          variant: item.variant || "",
          image: item.image || "",
        })),

        subtotal: Number(subtotal),
        shipping: Number(shipping),
        discount: Number(discount),

        coupon_code: "",

        total: Number(total),

        payment_method: paymentMethod,

        status: "new",

        note: form.note.trim(),
      };

      const saved = await placeOrder(orderData);

      if (!saved) {
        throw new Error("অর্ডার সংরক্ষণ করা যায়নি।");
      }

      const savedOrderCode =
        saved.order_code || orderCode;

      clearCart();

      navigate(`/order-success/${savedOrderCode}`, {
        replace: true,
        state: {
          order: {
            ...orderData,
            ...saved,
            order_code: savedOrderCode,
          },
        },
      });

    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err?.message ||
        "অর্ডার সম্পন্ন হয়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🛒</div>

        <h2 className="text-2xl font-bold mb-2">
          আপনার কার্ট খালি
        </h2>

        <p className="text-gray-500 mb-6">
          অর্ডার করার জন্য আগে পণ্য কার্টে যোগ করুন।
        </p>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold"
        >
          শপিং শুরু করুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-2">
        Checkout
      </h1>

      <p className="text-gray-500 mb-8">
        আপনার ডেলিভারি তথ্য দিয়ে অর্ডার সম্পন্ন করুন।
      </p>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Customer Information */}

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white border rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                ডেলিভারি তথ্য
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="block font-medium mb-2">
                    আপনার নাম *
                  </label>

                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="সম্পূর্ণ নাম লিখুন"
                    autoComplete="name"
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    মোবাইল নম্বর *
                  </label>

                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={11}
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    সম্পূর্ণ ঠিকানা *
                  </label>

                  <textarea
                    name="customer_address"
                    value={form.customer_address}
                    onChange={handleChange}
                    placeholder="বাসা, রোড, এলাকা, থানা, জেলা লিখুন"
                    autoComplete="street-address"
                    rows={4}
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    অতিরিক্ত নোট (ঐচ্ছিক)
                  </label>

                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="অর্ডার সম্পর্কে কোনো নির্দেশনা থাকলে লিখুন"
                    rows={3}
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

              </div>
            </div>

            {/* Payment Method */}

            <div className="bg-white border rounded-xl p-6">

              <h2 className="text-xl font-bold mb-5">
                পেমেন্ট পদ্ধতি
              </h2>

              <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="w-5 h-5"
                />

                <div>
                  <p className="font-semibold">
                    Cash on Delivery (COD)
                  </p>

                  <p className="text-sm text-gray-500">
                    পণ্য হাতে পাওয়ার পর টাকা পরিশোধ করুন।
                  </p>
                </div>
              </label>

            </div>

          </div>

          {/* Order Summary */}

          <div className="lg:col-span-1">

            <div className="bg-white border rounded-xl p-6 sticky top-5">

              <h2 className="text-xl font-bold mb-5">
                আপনার অর্ডার
              </h2>

              <div className="space-y-4 mb-5">

                {cart.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex gap-3 items-center"
                  >

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        🏍️
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">
                        {item.name}
                      </p>

                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {item.variant}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        {money(item.price)} × {item.qty}
                      </p>
                    </div>

                    <p className="font-semibold whitespace-nowrap">
                      {money(
                        Number(item.price || 0) *
                        Number(item.qty || 1)
                      )}
                    </p>

                  </div>
                ))}

              </div>

              <hr />

              <div className="space-y-3 py-5">

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery Charge
                  </span>

                  <span className="font-medium">
                    {money(shipping)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Discount
                  </span>

                  <span className="text-green-600 font-medium">
                    -{money(discount)}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>

                  <span>
                    {money(total)}
                  </span>
                </div>

              </div>

              {error && (
                <div
                  role="alert"
                  className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm mb-4"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !cart.length}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold transition"
              >
                {loading
                  ? "অর্ডার প্রসেস হচ্ছে..."
                  : "অর্ডার কনফার্ম করুন"}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                আপনার অর্ডারের তথ্য নিরাপদে সংরক্ষণ করা হবে।
              </p>

            </div>

          </div>

        </div>

      </form>

    </div>
  );
}
