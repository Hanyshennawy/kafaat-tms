import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MyApplications() {
  const { data: applications } = trpc.teachersLicensing.getAllApplications.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-teal-600" />
          My Applications
        </h1>
        <p className="text-muted-foreground mt-1">Track your teaching license applications</p>
      </div>

      <div className="grid gap-4">
        {applications?.map(app => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>License Application #{app.id}</CardTitle>
                  {app.submittedAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge>{app.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/licensing/applications/${app.id}`}>
                <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
