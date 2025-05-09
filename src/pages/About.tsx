
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Placeholder images
const founderImage = '/placeholder.svg';
const storyImage = '/placeholder.svg';
const valuesImage = '/placeholder.svg';
const qualityImage = '/placeholder.svg';

const About = () => {
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-cream-100 py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-800 font-playfair">Our Story</h1>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-8"></div>
            <p className="text-lg md:text-xl text-brand-700 mb-8">
              Learn about our journey to create India's finest premium makhana snacks, 
              from sustainable sourcing to artisanal roasting techniques.
            </p>
          </div>
        </div>
      </section>

      {/* Our Beginning */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://res.cloudinary.com/dlvxjnycr/image/upload/v1746699710/puff_02_gono4m.jpg" 
                  alt="The beginning of Natural Puff" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair">Our Beginning</h2>
              <div className="w-20 h-1 bg-gold-500 mb-6">
                
              </div>
              <p className="text-lg text-brand-700 mb-6">
                Natural Puff began in 2022 in Darbhanga, where our founder 
                Animesh Doshi experimented with different flavors and roasting techniques 
                to create the perfect healthy snack.
              </p>
              <p className="text-lg text-brand-700 mb-6">
                After months of perfecting recipes and sharing them with friends and family, 
                the overwhelming positive response inspired Animesh to transform his passion 
                project into a full-fledged business with a mission to revolutionize healthy snacking in India.
              </p>
              <p className="text-lg text-brand-700">
                Today, Natural Puff has grown from that small kitchen experiment to a beloved brand 
                trusted by health-conscious snackers across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team section  */}
      <section className="py-24 md:py-32 bg-cream-200 relative overflow-hidden">
        <motion.div 
          className="absolute top-40 right-[20%] w-96 h-96 rounded-full bg-cream-300 mix-blend-multiply filter blur-[100px] opacity-30"
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container-custom">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-4 inline-block">Meet Our Team</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-playfair">Our Co-founders</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-6"></div>
            <p className="mt-4 text-xl text-brand-700 max-w-2xl mx-auto">
              The visionaries behind Natural Puff who are passionate about creating healthy snacking alternatives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Founder 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <div className="mb-6 mx-auto md:mx-0 w-48 h-48 rounded-full overflow-hidden border-4 border-brand-100">
                <img 
                  src="https://res.cloudinary.com/dlvxjnycr/image/upload/v1746450710/Screenshot_2025-05-05_184100_ssvwxw.png" 
                  alt="Animesh Doshi" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-brand-800 mb-2">Animesh Doshi</h3>
              <p className="text-brand-600 font-medium mb-4">Founder & CEO</p>
              <p className="text-brand-700 mb-4">
              Animesh is a seasoned entrepreneur with over 10+ years of experience in the distribution of leading multi-brand FMCG products. His deep expertise in supply chain management, marketing, and business development laid the foundation for Natural Puff. With a clear vision for delivering healthy and high-quality snacks, Animesh leads the brand’s growth, innovation, and long-term strategy.

              </p>
            </motion.div>

            {/* Founder 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <div className="mb-6 mx-auto md:mx-0 w-48 h-48 rounded-full overflow-hidden border-4 border-brand-100">
                <img 
                  src="https://res.cloudinary.com/dlvxjnycr/image/upload/v1746438074/WhatsApp_Image_2025-05-05_at_14.47.13_4e153e55_jvcaar.jpg" 
                  alt="Ravi Prakash" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-brand-800 mb-2">Ravi Prakash</h3>
              <p className="text-brand-600 font-medium mb-4">Co-founder & COO</p>
              <p className="text-brand-700 mb-4">
              Ravi brings an unwavering focus on health, consistency, and excellence. His commitment to clean, wholesome snacking ensures that every product from Natural Puff meets the highest quality standards. Ravi’s attention to detail and dedication to customer satisfaction play a vital role in the brand’s promise of purity and taste.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section-padding bg-cream-200">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="w-full lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://res.cloudinary.com/dlvxjnycr/image/upload/v1746701162/dish_wjnf15.png" 
                  alt="Animesh Doshi, Founder of Natural Puff" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair">Our Founder</h2>
              <div className="w-20 h-1 bg-gold-500 mb-6"></div>
              <p className="text-lg text-brand-700 mb-6">
                Animesh Doshi, the visionary behind Natural Puff, has always been passionate 
                about nutrition and culinary innovation. With a background in food science and 
                a love for traditional Indian ingredients, he set out to transform the humble 
                makhana into a premium snacking experience.
              </p>
              <p className="text-lg text-brand-700 mb-6">
                "I wanted to create snacks that were both delicious and nutritious – 
                something you could enjoy without guilt while still satisfying your cravings. 
                Makhana, with its neutral flavor profile and impressive nutritional benefits, 
                was the perfect canvas for this vision."
              </p>
              <p className="italic text-brand-700 text-lg">
                — Animesh Doshi, Founder & CEO
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://res.cloudinary.com/dlvxjnycr/image/upload/v1746699710/puff_02_gono4m.jpg" 
                  alt="Natural Puff Values" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair">Our Values</h2>
              <div className="w-20 h-1 bg-gold-500 mb-6"></div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-brand-600 text-white rounded-full p-3 mr-4 mt-1">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-playfair">Quality Without Compromise</h3>
                    <p className="text-brand-700">
                      We source only the highest grade makhana and pair them with premium ingredients 
                      to create an exceptional snacking experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-brand-600 text-white rounded-full p-3 mr-4 mt-1">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-playfair">Sustainability</h3>
                    <p className="text-brand-700">
                      We work directly with farmers using sustainable practices and minimize our 
                      environmental footprint through eco-friendly packaging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-brand-600 text-white rounded-full p-3 mr-4 mt-1">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-playfair">Transparency</h3>
                    <p className="text-brand-700">
                      We believe in complete honesty about our ingredients, processes, and nutritional 
                      information so you can snack with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="section-padding bg-brand-600 text-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="w-full lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://res.cloudinary.com/dlvxjnycr/image/upload/v1746701162/dish_wjnf15.png" 
                  alt="Our Quality Commitment" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair">Our Quality Commitment</h2>
              <div className="w-20 h-1 bg-gold-500 mb-6"></div>
              <p className="text-lg mb-6">
                At Natural Puff, quality is our cornerstone. Every batch of our makhana undergoes 
                rigorous testing and quality checks at multiple stages of production.
              </p>
              <p className="text-lg mb-6">
                We carefully select our makhana from specific regions known for producing the best quality. 
                Our roasting process is meticulously controlled to ensure perfect texture and flavor 
                development while preserving the nutritional benefits.
              </p>
              <p className="text-lg mb-8">
                All our products are free from artificial colors, flavors, and preservatives. 
                We believe that the best taste comes from nature itself.
              </p>
              <Link to="/products">
                <Button className="bg-gold-500 hover:bg-gold-600 text-brand-800">
                  Explore Our Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-cream-100">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair">Our Journey</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-6"></div>
            <p className="text-lg text-brand-700">
              The milestones that have shaped Natural Puff into what it is today.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative border-l-4 border-brand-600 ml-6 pl-10 pb-10">
              {/* 2018 */}
              <div className="mb-12">
                <div className="absolute -left-6 bg-brand-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="mt-0.5">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-playfair">2022 - The Beginning</h3>
                <p className="text-brand-700">
                  Natural Puff was founded in a small kitchen in Mumbai. First three flavors were developed 
                  and shared with friends and family.
                </p>
              </div>

              {/* 2019 */}
              <div className="mb-12">
                <div className="absolute -left-6 bg-brand-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="mt-0.5">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-playfair">2022 - First Store</h3>
                <p className="text-brand-700">
                  Opened our first retail location in Darbhanga and began partnering with select health food stores.
                </p>
              </div>

              {/* 2020 */}
              <div className="mb-12">
                <div className="absolute -left-6 bg-brand-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="mt-0.5">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-playfair">2023 - Going Online</h3>
                <p className="text-brand-700">
                  Launched our e-commerce store and expanded our product line to include five new flavors.
                </p>
              </div>

              {/* 2021 */}
              <div className="mb-12">
                <div className="absolute -left-6 bg-brand-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="mt-0.5">4</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-playfair">2024 - Expansion</h3>
                <p className="text-brand-700">
                  Moved to a larger production facility and began distribution across major cities in India.
                </p>
              </div>

              {/* 2022 */}
              <div className="mb-12">
                <div className="absolute -left-6 bg-brand-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="mt-0.5">5</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-playfair">2024 - Recognition</h3>
                <p className="text-brand-700">
                  Won "Best Healthy Snack" award at the National Food Innovation Summit.
                </p>
              </div>

              {/* 2023 */}
              <div>
                <div className="absolute -left-6 bg-gold-500 text-brand-800 text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="mt-0.5">6</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-playfair">2025 - Present</h3>
                <p className="text-brand-700">
                  Continuing to innovate with new flavors while maintaining our commitment to quality and sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-cream-200">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">Experience Natural Puff</h2>
            <p className="text-lg text-brand-700 mb-8">
              Ready to try our premium makhana snacks? Explore our product range and discover your new favorite healthy snack.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-6 text-lg">
                  Shop Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white px-8 py-6 text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
