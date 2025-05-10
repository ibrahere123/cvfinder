"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { CheckCircle, Database, Loader2, Server } from "lucide-react"

export function DatabaseConnectionWizard() {
  const [step, setStep] = useState(1)
  const [connectionType, setConnectionType] = useState<string>("direct")
  const [databaseType, setDatabaseType] = useState<string>("sql")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()

  const handleConnect = () => {
    setIsConnecting(true)
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
      // Redirect to dashboard after successful connection
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }, 2000)
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Database Connection</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-xl font-semibold">Choose Connection Type</h2>
              <p className="text-gray-600">Select how you want to connect to your resume database</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  connectionType === "direct"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200"
                }`}
                onClick={() => setConnectionType("direct")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Database className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-medium text-lg">Direct Database Connection</h3>
                </div>
                <p className="text-gray-600">
                  Connect directly to your database server. Supports SQL Server, MySQL, PostgreSQL, and more.
                </p>
              </div>

              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  connectionType === "api"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200"
                }`}
                onClick={() => setConnectionType("api")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Server className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-medium text-lg">API Connection</h3>
                </div>
                <p className="text-gray-600">
                  Connect via your existing API. Ideal if you have a custom resume management system.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && connectionType === "direct" && (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-xl font-semibold">Database Configuration</h2>
              <p className="text-gray-600">Enter your database connection details</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="db_type">Database Type</Label>
                <Select defaultValue={databaseType} onValueChange={setDatabaseType}>
                  <SelectTrigger id="db_type" className="mt-1">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sql">Microsoft SQL Server</SelectItem>
                    <SelectItem value="mysql">MySQL / MariaDB</SelectItem>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="host">Host / Server</Label>
                <Input id="host" placeholder="e.g., localhost or 192.168.1.1" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    placeholder={
                      databaseType === "sql"
                        ? "1433"
                        : databaseType === "mysql"
                          ? "3306"
                          : databaseType === "postgres"
                            ? "5432"
                            : databaseType === "oracle"
                              ? "1521"
                              : databaseType === "mongodb"
                                ? "27017"
                                : ""
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="database">Database Name</Label>
                  <Input id="database" placeholder="e.g., resume_db" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Database username" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Database password" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && connectionType === "api" && (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-xl font-semibold">API Configuration</h2>
              <p className="text-gray-600">Enter your API connection details</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="api_url">API Endpoint URL</Label>
                <Input id="api_url" placeholder="https://your-company.com/api/resumes" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="api_key">API Key / Token</Label>
                <Input id="api_key" type="password" placeholder="Your API authentication key" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="api_format">Response Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger id="api_format" className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-xl font-semibold">Resume Data Mapping</h2>
              <p className="text-gray-600">Tell us where to find resume data in your database</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="table_name">Table/Collection Name</Label>
                <Input id="table_name" placeholder="e.g., resumes, candidates" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field_resume">Resume Content Field</Label>
                  <Input id="field_resume" placeholder="e.g., resume_text, content" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="field_skills">Skills Field</Label>
                  <Input id="field_skills" placeholder="e.g., skills, technologies" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field_experience">Experience Field</Label>
                  <Input id="field_experience" placeholder="e.g., experience, work_history" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="field_education">Education Field</Label>
                  <Input id="field_education" placeholder="e.g., education, degrees" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-xl font-semibold">Connect and Finish</h2>
              <p className="text-gray-600">Review your settings and connect to your database</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-4">Connection Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection Type:</span>
                  <span className="font-medium">
                    {connectionType === "direct" ? "Direct Database Connection" : "API Connection"}
                  </span>
                </div>
                {connectionType === "direct" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database Type:</span>
                      <span className="font-medium">
                        {databaseType === "sql"
                          ? "Microsoft SQL Server"
                          : databaseType === "mysql"
                            ? "MySQL / MariaDB"
                            : databaseType === "postgres"
                              ? "PostgreSQL"
                              : databaseType === "oracle"
                                ? "Oracle"
                                : "MongoDB"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Host:</span>
                      <span className="font-medium">localhost (example)</span>
                    </div>
                  </>
                )}
                {connectionType === "api" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Endpoint:</span>
                    <span className="font-medium">https://your-company.com/api/resumes</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Mapping:</span>
                  <span className="font-medium">Configured</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex items-center gap-3">
              <div className="bg-emerald-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-800 text-sm">
                  Your data security is our priority. All connections are encrypted and we never store your database
                  credentials.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Connected!
                  </>
                ) : (
                  "Connect Database"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
