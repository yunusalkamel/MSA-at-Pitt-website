import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Calendar, Users } from "lucide-react";
import Layout from "@/components/Layout";
import patternImg from "@/assets/islamic-pattern.jpg";

const NotFound = () => (
  <Layout>
    <section className="relative min-h-[75vh] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh-gold" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
      

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass-card-strong glass-glow p-8 md:p-12 text-center">
          <p className="font-display text-7xl md:text-8xl font-bold text-gradient-gold inline-block pb-2 mb-2">404</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Page Not Found</h1>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed">
            The page you're looking for may have moved or doesn't exist. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-premium text-sm px-6 py-2.5">
              <Home size={14} /> Go Home
            </Link>
            <Link to="/events" className="btn-premium-secondary text-sm px-6 py-2.5">
              <Calendar size={14} /> Events
            </Link>
            <Link to="/join" className="btn-premium-secondary text-sm px-6 py-2.5">
              <Users size={14} /> Join MSA
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  </Layout>
);

export default NotFound;
