import { useAuth, enableDemoMode } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { 
  Users, TrendingUp, Target, MessageSquare, Briefcase, Award, GraduationCap,
  ArrowRight, CheckCircle, BarChart3, Shield, Play, ChevronDown, ChevronUp,
  Globe, Lock, Cloud, Zap, Star, Quote, Building, School, UserCheck, Clock,
  Mail, Phone, MapPin, Sparkles, ArrowUpRight, MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Animated counter hook
function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } }
};

// FAQ Accordion Component
function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div 
      className="border-b border-gray-200 last:border-0"
      initial={false}
    >
      <button
        onClick={onClick}
        className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-4 text-gray-600">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Stats counters
  const usersCounter = useCounter(15000);
  const schoolsCounter = useCounter(250);
  const satisfactionCounter = useCounter(98);
  const timeSavedCounter = useCounter(45);

  const modules = [
    {
      icon: TrendingUp,
      title: "Career Progression",
      description: "AI-driven career path recommendations and skill development tracking",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "Track 50+ career paths",
      link: "/career/paths"
    },
    {
      icon: Users,
      title: "Succession Planning",
      description: "Leadership pipeline management and talent pool development",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "9-Box grid analytics",
      link: "/succession/plans"
    },
    {
      icon: BarChart3,
      title: "Workforce Planning",
      description: "Scenario modeling and dynamic resource allocation",
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "Predictive forecasting",
      link: "/workforce/scenarios"
    },
    {
      icon: MessageSquare,
      title: "Employee Engagement",
      description: "Surveys, sentiment analysis, and engagement tracking",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      stats: "Real-time pulse surveys",
      link: "/engagement/surveys"
    },
    {
      icon: Briefcase,
      title: "Recruitment",
      description: "AI-powered hiring with resume parsing and candidate matching",
      color: "text-red-600",
      bgColor: "bg-red-50",
      stats: "85% faster hiring",
      link: "/recruitment/requisitions"
    },
    {
      icon: Target,
      title: "Performance Management",
      description: "SMART goals, 360° feedback, and continuous performance tracking",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: "360° feedback system",
      link: "/performance/cycles"
    },
    {
      icon: GraduationCap,
      title: "Teachers Licensing",
      description: "Complete licensing lifecycle with blockchain verification",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      stats: "Blockchain verified",
      link: "/licensing/dashboard"
    },
    {
      icon: Award,
      title: "Competency Management",
      description: "Define frameworks, assess competencies, and track professional development",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: "Standards-based assessment",
      link: "/competency/frameworks"
    },
    {
      icon: Building,
      title: "Placement & Transfer",
      description: "Staff placement requests, transfers, and organizational directory",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      stats: "Seamless transfers",
      link: "/placement/dashboard"
    },
  ];

  const features = [
    { icon: Sparkles, text: "AI-Powered Recommendations" },
    { icon: BarChart3, text: "Real-time Analytics & Dashboards" },
    { icon: Shield, text: "Blockchain Verification" },
    { icon: Globe, text: "UAE Pass Integration" },
    { icon: Globe, text: "Multi-language (Arabic/English)" },
    { icon: Zap, text: "Mobile Responsive Design" },
    { icon: Lock, text: "Role-Based Access Control" },
    { icon: Cloud, text: "Azure Cloud Hosted" },
  ];

  const testimonials = [
    {
      quote: "Kafaat has transformed how we manage our teaching staff. The AI-powered recommendations have helped us identify and develop talent we didn't even know we had.",
      author: "Dr. Sarah Al-Rashid",
      role: "Director of HR",
      organization: "Dubai Education Zone",
      avatar: "SA"
    },
    {
      quote: "The licensing module has streamlined our entire certification process. What used to take weeks now takes days, with complete blockchain verification.",
      author: "Ahmed Hassan",
      role: "Licensing Coordinator",
      organization: "Abu Dhabi Schools Council",
      avatar: "AH"
    },
    {
      quote: "The succession planning features give us confidence that our leadership pipeline is strong. We can now plan 3-5 years ahead with data-driven insights.",
      author: "Fatima Al-Mansoori",
      role: "Talent Development Manager",
      organization: "MOE Central Office",
      avatar: "FM"
    }
  ];

  const howItWorks = [
    { step: 1, title: "Sign Up", description: "Create your organization account in minutes with our streamlined onboarding process" },
    { step: 2, title: "Configure", description: "Set up your organizational structure, roles, and customize modules to your needs" },
    { step: 3, title: "Import Data", description: "Bulk upload employee data or integrate with existing HR systems seamlessly" },
    { step: 4, title: "Transform", description: "Start making data-driven talent decisions with AI-powered insights" }
  ];

  const integrations = [
    { name: "Microsoft Azure", logo: "☁️" },
    { name: "UAE Pass", logo: "🇦🇪" },
    { name: "TDRA Compliant", logo: "✅" },
    { name: "ISO 27001", logo: "🔒" },
    { name: "GDPR Ready", logo: "🛡️" },
    { name: "SSO/SAML", logo: "🔑" }
  ];

  const faqs = [
    {
      question: "How long does implementation take?",
      answer: "Most organizations are fully operational within 2-4 weeks. Our dedicated implementation team provides hands-on support, data migration assistance, and training for your HR team."
    },
    {
      question: "Is my data secure and compliant with UAE regulations?",
      answer: "Absolutely. Kafaat is hosted on Microsoft Azure's UAE data centers, is TDRA compliant, and follows international standards including ISO 27001. All data stays within UAE borders."
    },
    {
      question: "Can I integrate with existing HR systems?",
      answer: "Yes! We offer REST APIs, webhooks, and pre-built connectors for popular HR systems. Our team can help with custom integrations as well."
    },
    {
      question: "What training and support is included?",
      answer: "All plans include comprehensive onboarding, video tutorials, and documentation. Professional and Enterprise plans include dedicated account managers and priority support."
    },
    {
      question: "How does the AI recommendation engine work?",
      answer: "Our AI analyzes employee skills, performance data, career aspirations, and organizational needs to provide personalized career path recommendations, succession candidates, and skill development plans."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-30"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) 
            }}
            animate={{ 
              y: [null, Math.random() * -200 - 100],
              x: [null, (Math.random() - 0.5) * 100]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </motion.div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing">
                  <Button variant="ghost">Pricing</Button>
                </Link>
                <Button variant="ghost" onClick={enableDemoMode}>
                  Sign In
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" onClick={enableDemoMode}>
                    <Play className="h-4 w-4 mr-2" />
                    Try Demo
                  </Button>
                </motion.div>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Start Free Trial
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto py-20 px-4 text-center relative">
        {/* UAE Vision Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-8"
        >
          <span className="text-2xl">🇦🇪</span>
          <span className="text-sm font-medium text-green-700">Aligned with UAE Vision 2031</span>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold leading-tight"
            variants={fadeInUp}
          >
            Comprehensive Talent Management
            <br />
            <motion.span 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              for UAE Ministry of Education
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Empowering HR excellence with AI-driven insights, comprehensive workforce planning,
            and seamless integration with UAE government systems.
          </motion.p>

          {/* Trust badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 pt-4"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 px-3 py-1.5 rounded-full border">
              <Shield className="h-4 w-4 text-green-600" />
              <span>TDRA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 px-3 py-1.5 rounded-full border">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 px-3 py-1.5 rounded-full border">
              <Cloud className="h-4 w-4 text-purple-600" />
              <span>UAE Data Residency</span>
            </div>
          </motion.div>

          <motion.div 
            className="flex gap-4 justify-center pt-6"
            variants={fadeInUp}
          >
            {isAuthenticated ? (
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                    Open Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" onClick={enableDemoMode} className="gap-2">
                    <Play className="h-4 w-4" />
                    Watch Demo
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
          
          {!isAuthenticated && (
            <motion.p 
              className="text-sm text-muted-foreground mt-4"
              variants={fadeInUp}
            >
              14-day free trial • No credit card required • Cancel anytime
            </motion.p>
          )}
        </motion.div>

      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn} className="space-y-2" ref={usersCounter.ref}>
              <div className="text-4xl md:text-5xl font-bold">{usersCounter.count.toLocaleString()}+</div>
              <div className="text-blue-100 flex items-center justify-center gap-2">
                <UserCheck className="h-4 w-4" />
                Active Users
              </div>
            </motion.div>
            <motion.div variants={scaleIn} className="space-y-2" ref={schoolsCounter.ref}>
              <div className="text-4xl md:text-5xl font-bold">{schoolsCounter.count}+</div>
              <div className="text-blue-100 flex items-center justify-center gap-2">
                <School className="h-4 w-4" />
                Schools & Institutions
              </div>
            </motion.div>
            <motion.div variants={scaleIn} className="space-y-2" ref={satisfactionCounter.ref}>
              <div className="text-4xl md:text-5xl font-bold">{satisfactionCounter.count}%</div>
              <div className="text-blue-100 flex items-center justify-center gap-2">
                <Star className="h-4 w-4" />
                Satisfaction Rate
              </div>
            </motion.div>
            <motion.div variants={scaleIn} className="space-y-2" ref={timeSavedCounter.ref}>
              <div className="text-4xl md:text-5xl font-bold">{timeSavedCounter.count}%</div>
              <div className="text-blue-100 flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Time Saved
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto py-20 px-4">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Nine Integrated Modules</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete suite of tools to manage every aspect of talent management and development
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Link href={module.link}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-200 h-full">
                    <CardHeader>
                      <motion.div 
                        className={`w-14 h-14 rounded-xl ${module.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`h-7 w-7 ${module.color}`} />
                      </motion.div>
                      <CardTitle className="flex items-center justify-between">
                        {module.title}
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                        {module.stats}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with Kafaat in four simple steps
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {howItWorks.map((item, index) => (
              <motion.div 
                key={index} 
                className="relative text-center"
                variants={fadeInUp}
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-purple-200" />
                )}
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.step}
                </motion.div>
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Features</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology and best practices for the UAE public sector
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Education Leaders</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what HR professionals across the UAE education sector say about Kafaat
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Quote className="h-8 w-8 text-blue-200 mb-2" />
                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-sm text-blue-600">{testimonial.organization}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations & Security Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Integrations & Security</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Enterprise-grade security with seamless integrations for UAE government systems
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {integrations.map((integration, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={scaleIn}
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-2 bg-white/10 rounded-xl flex items-center justify-center text-3xl">
                  {integration.logo}
                </div>
                <div className="text-sm text-gray-300">{integration.name}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-16 max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <h4 className="text-xl font-bold mb-2">UAE Data Residency Guaranteed</h4>
              <p className="text-gray-300">
                All data is stored in Microsoft Azure's UAE data centers, ensuring compliance with local data protection regulations and TDRA requirements.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Got questions? We've got answers
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-3xl mx-auto bg-gray-50 rounded-2xl overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20 px-4 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <CardHeader className="relative z-10 pt-12">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
              </motion.div>
              <CardTitle className="text-3xl md:text-4xl text-white">Ready to Transform Your HR Operations?</CardTitle>
              <CardDescription className="text-blue-100 text-lg mt-4">
                Join leading UAE education institutions in revolutionizing talent management
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pb-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="secondary" className="gap-2">
                        Go to Dashboard <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="secondary" className="gap-2" onClick={enableDemoMode}>
                        Start Free Trial <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <Link href="/pricing">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 gap-2">
                          View Pricing
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-6 text-blue-100 text-sm">
                🎉 Limited offer: Get 20% off on annual plans this month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Mail className="h-10 w-10 mx-auto mb-4 text-blue-600" />
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest updates on new features, best practices, and industry insights
            </p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {APP_TITLE}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive talent management solution for UAE education sector
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing"><span className="hover:text-blue-600 cursor-pointer">Pricing</span></Link></li>
                <li><Link href="/dashboard"><span className="hover:text-blue-600 cursor-pointer">Features</span></Link></li>
                <li><Link href="/signup"><span className="hover:text-blue-600 cursor-pointer">Free Trial</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-blue-600 cursor-pointer">Documentation</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">API Reference</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Support Center</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@kafaat.ae
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +971 2 123 4567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Abu Dhabi, UAE
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 UAE Ministry of Education - Talent Management System</p>
            <p className="mt-2">Powered by <span className="font-semibold text-blue-600">Manus AI</span></p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.button
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
        
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-2xl border overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <h4 className="font-semibold">Need Help?</h4>
              <p className="text-sm text-blue-100">We're here to assist you</p>
            </div>
            <div className="p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={enableDemoMode}>
                <Play className="h-4 w-4" />
                Try Interactive Demo
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                Contact Sales
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Phone className="h-4 w-4" />
                Schedule a Call
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
