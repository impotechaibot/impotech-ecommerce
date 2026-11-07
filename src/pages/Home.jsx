import HeroSlider from '../components/HeroSlider.jsx';
import CategoryStrip from '../components/CategoryStrip.jsx';
import BannerGrid from '../components/BannerGrid.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Services from '../components/Services.jsx';
import Newsletter from '../components/Newsletter.jsx';

// Home page — same section order as the v2 static page:
// hero → categories → banners → products → services → newsletter.
const Home = () => (
  <>
    <HeroSlider />
    <CategoryStrip />
    <BannerGrid />
    <ProductGrid />
    <Services />
    <Newsletter />
  </>
);

export default Home;
