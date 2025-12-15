import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, Shield, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function LicensingPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-teal-600">Teachers Licensing Portal</h1>
          <Link href="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
      </header>

      <div className="container mx-auto py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <GraduationCap className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">UAE Teachers Licensing</h2>
          <p className="text-lg text-muted-foreground">
            Complete licensing lifecycle management with blockchain verification for UAE Ministry of Education
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>Apply for License</CardTitle>
              <CardDescription>Submit a new teaching license application</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/apply">
                <Button className="w-full gap-2">Apply Now <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Verify License</CardTitle>
              <CardDescription>Verify the authenticity of a teaching license</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/verify">
                <Button variant="outline" className="w-full gap-2">Verify <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track your license application status</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/my-applications">
                <Button variant="outline" className="w-full gap-2">View <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>CPD Records</CardTitle>
              <CardDescription>Manage Continuing Professional Development</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/cpd">
                <Button variant="outline" className="w-full gap-2">View <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-teal-600 to-blue-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Blockchain-Verified Credentials</CardTitle>
            <CardDescription className="text-teal-100">
              All teaching licenses are secured with blockchain technology for tamper-proof verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Secure</h3>
                  <p className="text-sm text-teal-100">Immutable blockchain records</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Verified</h3>
                  <p className="text-sm text-teal-100">Instant verification worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Transparent</h3>
                  <p className="text-sm text-teal-100">Complete audit trail</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
