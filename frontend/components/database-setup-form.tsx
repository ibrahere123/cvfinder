"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function DatabaseSetupForm() {
  const [dbType, setDbType] = useState("sql_server")
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleTestConnection = () => {
    setTestStatus("testing")
    // Simulate testing the connection
    setTimeout(() => {
      setTestStatus("success")
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Database Connection Settings</CardTitle>
        <CardDescription>
          Configure how ResumeRanker connects to your resume database. Your credentials are encrypted and never stored
          on our servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="direct" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Connection</TabsTrigger>
            <TabsTrigger value="api">API Connection</TabsTrigger>
          </TabsList>
          <TabsContent value="direct">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="db_type">Database Type</Label>
                    <Select defaultValue={dbType} onValueChange={setDbType}>
                      <SelectTrigger id="db_type" className="mt-1">
                        <SelectValue placeholder="Select database type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sql_server">Microsoft SQL Server</SelectItem>
                        <SelectItem value="mysql">MySQL / MariaDB</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="oracle">Oracle</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="host">Host / Server</Label>
                    <Input id="host" placeholder="e.g., localhost or 192.168.1.1" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      placeholder={
                        dbType === "sql_server"
                          ? "1433"
                          : dbType === "mysql"
                            ? "3306"
                            : dbType === "postgresql"
                              ? "5432"
                              : dbType === "oracle"
                                ? "1521"
                                : dbType === "mongodb"
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

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="Database username" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Database password" className="mt-1" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="ssl" />
                    <Label htmlFor="ssl">Use SSL/TLS encryption</Label>
                  </div>
                </div>

                <div>
                  <Label>Resume Table/Collection</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                    <Input placeholder="Table/Collection name (e.g., resumes)" />
                    <Input placeholder="ID field name (e.g., resume_id)" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Schema Mapping</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Map your database fields to our system for optimal resume ranking.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="field_name" className="text-xs">
                        Resume Content Field
                      </Label>
                      <Input id="field_name" placeholder="e.g., resume_text" className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="field_skills" className="text-xs">
                        Skills Field
                      </Label>
                      <Input id="field_skills" placeholder="e.g., skills" className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="field_experience" className="text-xs">
                        Experience Field
                      </Label>
                      <Input id="field_experience" placeholder="e.g., experience" className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="field_education" className="text-xs">
                        Education Field
                      </Label>
                      <Input id="field_education" placeholder="e.g., education" className="mt-1 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testStatus === "testing"}
                >
                  {testStatus === "testing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {testStatus === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                  {testStatus === "error" && <AlertCircle className="mr-2 h-4 w-4 text-red-500" />}
                  Test Connection
                </Button>

                {testStatus === "success" && <span className="text-sm text-green-600">Connection successful!</span>}
                {testStatus === "error" && (
                  <span className="text-sm text-red-600">Connection failed. Please check your settings.</span>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              <div>
                <Label htmlFor="api_url">API Endpoint URL</Label>
                <Input id="api_url" placeholder="https://your-company.com/api/resumes" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="api_key">API Key / Token</Label>
                <Input id="api_key" type="password" placeholder="Your API authentication key" className="mt-1" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="api_auth" />
                <Label htmlFor="api_auth">Use OAuth 2.0</Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">API Configuration</h3>
                <p className="text-sm text-gray-600 mb-4">Configure how our system interacts with your API.</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search_endpoint" className="text-xs">
                      Search Endpoint
                    </Label>
                    <Input id="search_endpoint" placeholder="e.g., /search or /query" className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="request_format" className="text-xs">
                      Request Format
                    </Label>
                    <Select defaultValue="json">
                      <SelectTrigger id="request_format" className="mt-1 text-sm">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="graphql">GraphQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect and Continue"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
