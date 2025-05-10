import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database, Server, Shield, ArrowRight } from "lucide-react"

export function DatabaseSetup() {
  const supportedDatabases = [
    {
      name: "SQL Server",
      icon: <Database className="h-8 w-8 text-emerald-600" />,
      description: "Connect to Microsoft SQL Server databases",
    },
    {
      name: "MySQL",
      icon: <Database className="h-8 w-8 text-emerald-600" />,
      description: "Connect to MySQL or MariaDB databases",
    },
    {
      name: "PostgreSQL",
      icon: <Database className="h-8 w-8 text-emerald-600" />,
      description: "Connect to PostgreSQL databases",
    },
    {
      name: "Oracle",
      icon: <Database className="h-8 w-8 text-emerald-600" />,
      description: "Connect to Oracle databases",
    },
    {
      name: "MongoDB",
      icon: <Database className="h-8 w-8 text-emerald-600" />,
      description: "Connect to MongoDB document databases",
    },
    {
      name: "Custom API",
      icon: <Server className="h-8 w-8 text-emerald-600" />,
      description: "Connect via REST API to any data source",
    },
  ]

  return (
    <section id="database-setup" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect to Your Database</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ResumeRanker works with your existing resume database. No need to migrate data or change your current
            systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {supportedDatabases.map((db, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                {db.icon}
                <div>
                  <CardTitle>{db.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{db.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-emerald-100 rounded-full p-4">
              <Shield className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Database Connection</h3>
              <p className="text-gray-600 mb-4">
                Your data security is our priority. All connections are encrypted and we never store your database
                credentials. ResumeRanker can be deployed on your own infrastructure for maximum security.
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/setup">
                  Configure Database Connection <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
