import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import AIAssistantWidget from '../components/AIAssistantWidget/AIAssistantWidget';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-layout__content">
        {children}
      </main>
      <Footer />
      <AIAssistantWidget />
    </div>
  );
};

export default MainLayout;
