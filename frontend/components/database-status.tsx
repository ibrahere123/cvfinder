import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"

export function DatabaseStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-600" />
          Database Connection
        </CardTitle>
        <CardDescription>Status of your database connection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="text-sm font-medium text-emerald-800">Connected</div>
              <div className="text-xs text-emerald-700">Last synced: 5 minutes ago</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Database Type:</span>
              <span className="font-medium text-gray-900">SQL Server</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Server:</span>
              <span className="font-medium text-gray-900">hr-database.company.com</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resume Records:</span>
              <span className="font-medium text-gray-900">12,458</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Update:</span>
              <span className="font-medium text-gray-900">Today, 10:45 AM</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button asChild size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/setup">Settings</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
