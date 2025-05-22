
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import HeroImage from "@/components/landing/HeroImage";
import FeatureCard from "@/components/landing/FeatureCard";
import TestimonialCard from "@/components/landing/TestimonialCard";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white py-4 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Ikizamini Portal</div>
          <div className="space-x-4 hidden md:flex items-center">
            <a href="#features" className="font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="font-medium text-gray-600 hover:text-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="font-medium text-gray-600 hover:text-primary transition-colors">Pricing</a>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
                The Smart Solution for Exam Management
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Streamline your examination process with our comprehensive platform designed for educational institutions, organizations, and test-takers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="px-8">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <HeroImage />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage examinations efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Comprehensive Exam Management" 
              description="Create, edit, and manage exams with ease. Support for multiple question types and automatic grading."
              icon="FileQuestion" 
            />
            <FeatureCard 
              title="User-Friendly Interface" 
              description="Intuitive design for admins and test-takers alike, ensuring a smooth testing experience for everyone."
              icon="LayoutDashboard" 
            />
            <FeatureCard 
              title="Detailed Analytics" 
              description="Get insights into test performance, pass rates, and more with comprehensive reporting tools."
              icon="BarChart" 
            />
            <FeatureCard 
              title="Multi-Organization Support" 
              description="Perfect for institutions managing multiple testing centers across different locations."
              icon="Building" 
            />
            <FeatureCard 
              title="Secure Authentication" 
              description="Role-based access control ensures the right people have access to the right features and data."
              icon="Lock" 
            />
            <FeatureCard 
              title="Mobile Responsive" 
              description="Take tests and manage the system from any device, anywhere, at any time."
              icon="Smartphone" 
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-80">Exams Administered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-80">Testing Centers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-80">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg opacity-80">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by educational institutions across Rwanda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The Ikizamini Portal has completely transformed how we administer exams. The efficiency gains are remarkable."
              author="Jean Mugabo"
              title="Testing Center Director"
            />
            <TestimonialCard 
              quote="Our administrative workload has been cut in half since implementing this system. The analytics help us improve our testing procedures."
              author="Marie Uwase"
              title="Operations Manager"
            />
            <TestimonialCard 
              quote="The support team is responsive and helpful. They've been with us every step of the way during implementation."
              author="Patrick Nkusi"
              title="IT Administrator"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="border rounded-lg p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl font-bold mb-4">Basic</div>
              <div className="text-4xl font-bold mb-2">$299<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <div className="text-gray-500 mb-6">For small institutions</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Up to 500 tests per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Get Started</Button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-primary rounded-lg p-8 bg-white shadow-md relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="text-xl font-bold mb-4">Professional</div>
              <div className="text-4xl font-bold mb-2">$599<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <div className="text-gray-500 mb-6">For medium institutions</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Up to 2,000 tests per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Priority email & phone support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Custom branding options</span>
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>

            {/* Enterprise Plan */}
            <div className="border rounded-lg p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl font-bold mb-4">Enterprise</div>
              <div className="text-4xl font-bold mb-2">Custom</div>
              <div className="text-gray-500 mb-6">For large organizations</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Unlimited tests</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Full analytics suite</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>24/7 dedicated support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Custom integration & development</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>On-premise deployment option</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Exam Process?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join hundreds of institutions who trust Ikizamini Portal for their examination needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" className="px-8">
              Schedule a Demo
            </Button>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary px-8">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
