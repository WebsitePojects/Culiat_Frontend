import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral">
      <Navbar />
      <main className="">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout;
