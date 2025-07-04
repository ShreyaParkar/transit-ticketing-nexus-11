
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Mail } from "lucide-react";

const AdminInstructions = () => {
  return (
    <Card className="border-transit-orange-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-transit-orange" />
          How to Access Admin Dashboard
        </CardTitle>
        <CardDescription>Follow these steps to gain admin access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-amber-50 border-amber-200">
          <Mail className="h-4 w-4 text-amber-600" />
          <AlertTitle>Admin Login Required</AlertTitle>
          <AlertDescription>
            To access the admin dashboard and manage routes, buses, and stations, you need
            to login with an admin account.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 mt-4">
          <h3 className="font-medium">Steps to access admin features:</h3>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Sign out if you're currently logged in</li>
            <li>Sign in with email: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">parkarshreya45@gmail.com</span></li>
            <li>Once logged in, admin features will be automatically enabled</li>
            <li>Access the admin dashboard through the sidebar menu</li>
          </ol>
        </div>

        <div className="bg-slate-50 p-3 rounded-md text-sm mt-4">
          <p className="text-slate-600 italic">
            Note: In a production environment, admin roles would be properly managed through a
            database with secure role assignments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInstructions;
