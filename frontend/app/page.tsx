import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Printer,
  Upload,
  Clock,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  MapPin,
  Sparkles,
  Zap,
  Award
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-tomato-500 to-deepOrange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Printer className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-charcoal-900">InstaPrint</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login/user">
                <Button variant="outline" size="sm" className="border-tomato-200 text-tomato-600 hover:bg-tomato-50 hover:border-tomato-300 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">Login as User</span>
                  <span className="sm:hidden">User</span>
                </Button>
              </Link>
              <Link href="/login/vendor">
                <Button variant="outline" size="sm" className="border-deepOrange-200 text-deepOrange-600 hover:bg-deepOrange-50 hover:border-deepOrange-300 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">Login as Vendor</span>
                  <span className="sm:hidden">Vendor</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tomato-50/30 via-transparent to-deepOrange-50/30"></div>
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-tomato-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-deepOrange-100 rounded-full opacity-20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-tomato-100 text-tomato-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Your Trusted Instant Printing Partner</span>
              <span className="sm:hidden">Trusted Printing Partner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-charcoal-900 mb-4 sm:mb-6 leading-tight">
              Print Instantly,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tomato-500 via-deepOrange-400 to-tomato-600">
                {" "}Anywhere
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-charcoal-600 mb-6 sm:mb-10 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">
              Skip the queues and get your documents printed instantly with professional quality.
              Upload your files and receive high-quality prints with fast pickup service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Link href="/login/user">
                <Button size="lg" className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-button hover:shadow-button-hover transform hover:scale-[1.02] transition-all duration-200 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg w-full sm:w-auto">
                  <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Get Started as User</span>
                  <span className="sm:inline">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/login/vendor">
                <Button variant="outline" size="lg" className="border-2 border-tomato-500 text-tomato-600 hover:bg-tomato-50 hover:border-tomato-600 transition-all duration-200 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg w-full sm:w-auto">
                  <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Join as Print Shop</span>
                  <span className="sm:inline">Join as Shop</span>
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-charcoal-500 px-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-500" />
                <span>100% Secure Payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-500" />
                <span>Verified Print Shops</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-500" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-3 sm:mb-4">
              Why Choose InstaPrint?
            </h2>
            <p className="text-base sm:text-lg text-charcoal-600 max-w-xl mx-auto">
              Experience the future of printing with our innovative platform designed for modern India
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center border-0 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group bg-gradient-to-br from-white to-cream-50 p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-tomato-100 to-tomato-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-tomato-200 group-hover:to-tomato-300 transition-all duration-300 shadow-lg">
                <Upload className="h-6 w-6 sm:h-7 sm:h-7 lg:h-8 lg:w-8 text-tomato-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-charcoal-900 mb-2 sm:mb-3">Easy Upload</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Upload documents in seconds with our intuitive drag-and-drop interface</p>
            </Card>

            <Card className="text-center border-0 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group bg-gradient-to-br from-white to-success-50 p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-success-200 group-hover:to-success-300 transition-all duration-300 shadow-lg">
                <Clock className="h-6 w-6 sm:h-7 sm:h-7 lg:h-8 lg:w-8 text-success-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-charcoal-900 mb-2 sm:mb-3">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Get your prints ready in minutes, not hours with our express service</p>
            </Card>

            <Card className="text-center border-0 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group bg-gradient-to-br from-white to-info-50 p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-info-100 to-info-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-info-200 group-hover:to-info-300 transition-all duration-300 shadow-lg">
                <MapPin className="h-6 w-6 sm:h-7 sm:h-7 lg:h-8 lg:w-8 text-info-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-charcoal-900 mb-2 sm:mb-3">Choose Your Vendor</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Select from multiple verified print shops in your area</p>
            </Card>

            <Card className="text-center border-0 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group bg-gradient-to-br from-white to-warning-50 p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-warning-200 group-hover:to-warning-300 transition-all duration-300 shadow-lg">
                <Shield className="h-6 w-6 sm:h-7 sm:h-7 lg:h-8 lg:w-8 text-warning-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-charcoal-900 mb-2 sm:mb-3">Secure & Safe</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Your documents are handled with bank-level security and privacy</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cream-50 to-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-charcoal-600">
              Get your documents printed in just 3 simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-tomato-500 to-tomato-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-button group-hover:shadow-button-hover transition-all duration-300 transform group-hover:scale-110">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-tomato-100 rounded-full flex items-center justify-center">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-tomato-600" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal-900 mb-2 sm:mb-4">Upload & Select</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Upload your document and choose from multiple verified print shops in your area</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-button group-hover:shadow-button-hover transition-all duration-300 transform group-hover:scale-110">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-success-600" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal-900 mb-2 sm:mb-4">Pay & Confirm</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Review pricing, make secure payment, and get instant confirmation</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-info-500 to-info-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-button group-hover:shadow-button-hover transition-all duration-300 transform group-hover:scale-110">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-info-100 rounded-full flex items-center justify-center">
                  <Printer className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-info-600" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal-900 mb-2 sm:mb-4">Pickup & Print</h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">Collect your professionally printed documents with the pickup code</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-tomato-500 via-deepOrange-500 to-tomato-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-white/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Print Instantly?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-10 leading-relaxed">
            Join thousands of satisfied customers and experience the future of printing today
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center px-2">
            <Link href="/login/user">
              <Button size="lg" variant="secondary" className="bg-white text-tomato-600 hover:bg-white/90 shadow-lg px-6 py-3 sm:px-10 sm:py-4 text-sm sm:text-lg font-semibold w-full sm:w-auto transform hover:scale-[1.02] transition-all duration-200">
                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Start Printing Now</span>
                <span className="sm:inline">Start Printing</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/login/vendor">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-tomato-600 px-6 py-3 sm:px-10 sm:py-4 text-sm sm:text-lg font-semibold w-full sm:w-auto transform hover:scale-[1.02] transition-all duration-200">
                <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-charcoal-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-tomato-500 to-deepOrange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Printer className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-2xl font-bold">InstaPrint</span>
          </div>
          <p className="text-charcoal-300 mb-3 sm:mb-4 text-sm sm:text-lg px-2">
            Printing Made Simple by Skipping the Queue's - Your Convenient Solution for Instant Print Services with Verified Vendors
          </p>
          <p className="text-charcoal-400 text-xs sm:text-sm">
            &copy; 2026 InstaPrint. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}