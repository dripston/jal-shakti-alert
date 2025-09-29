import React from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Waves, Users, Map, Smartphone, Shield, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <header className="px-4 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Pragyan Chakra</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-6">
            Smart Disaster Management with 
            <span className="text-primary">  Pragyan Chakra</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            A mobile-first platform for real-time water hazard reporting, community engagement, and data-driven decision making for sustainable water management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Pragyan Chakra Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform empowers communities to monitor, report, and manage water resources effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 shadow-card border border-border card-hover">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Report Hazards</h3>
              <p className="text-muted-foreground">
                Use our mobile app to instantly report water hazards, quality issues, or infrastructure problems in your area.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 shadow-card border border-border card-hover">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Map className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-time Maps</h3>
              <p className="text-muted-foreground">
                View real-time hazard maps and water quality data to make informed decisions about water usage.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 shadow-card border border-border card-hover">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Engage with your community to address water challenges collectively and build awareness.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background rounded-xl p-6 shadow-card border border-border card-hover">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Offline Capability</h3>
              <p className="text-muted-foreground">
                Report issues even without internet connectivity. Data syncs automatically when you're back online.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background rounded-xl p-6 shadow-card border border-border card-hover">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Access detailed analytics and insights to track water quality trends and community engagement.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background rounded-xl p-6 shadow-card border border-border card-hover">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Waves className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Decision Support</h3>
              <p className="text-muted-foreground">
                Leverage AI-powered insights to make data-driven decisions for sustainable water management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of community members working together for sustainable water management.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-primary hover:bg-primary-foreground text-lg px-8 py-6">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Waves className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-primary">Pragyan Chakra</span>
            </div>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Pragyan Chakra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;