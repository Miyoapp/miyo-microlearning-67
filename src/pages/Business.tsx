
import React from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/business/HeroSection";
import HowItWorksSection from "@/components/business/HowItWorksSection";
import BenefitsSection from "@/components/business/BenefitsSection";
import ContactForm from "@/components/business/ContactForm";
import BusinessFooter from "@/components/business/BusinessFooter";

const Business = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <ContactForm />
      <BusinessFooter />
    </div>
  );
};

export default Business;
