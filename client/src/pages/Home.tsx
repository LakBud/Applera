import { useState } from "react";
import JobForm from "../components/JobForm";
import Result from "../components/Result";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import type { CreateApplicationResponse } from "../api";

export default function Home() {
  const [result, setResult] = useState<CreateApplicationResponse | null>(null);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="max-w-3xl w-full text-center space-y-3 mb-8">
        <Badge variant="secondary">AI Powered</Badge>
        <h1 className="text-4xl font-bold tracking-tight">AI Job Application Generator</h1>
        <p className="text-muted-foreground text-base">
          Paste your CV and job description — get a tailored søknad, CV summary, and email instantly.
        </p>
      </div>

      {/* Main layout */}
      <div className="w-full max-w-3xl space-y-6">
        {/* Input — Card lives here, not inside JobForm */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Generate Application</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm onResult={setResult} />
          </CardContent>
        </Card>

        {/* Result — Card lives inside Result component, not here */}
        {result && (
          <>
            <Separator />
            <Result data={result} />
          </>
        )}
      </div>
    </div>
  );
}
