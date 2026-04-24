import React from 'react';
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";

export default function TestPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Page</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              This is a simple test page to verify routing is working
            </p>
          </div>
        </div>

        <Card className="p-6">
          <p>If you can see this page, basic routing and layout components are working correctly.</p>
          <p className="mt-2">This means there might be specific issues with other pages like the Friends page.</p>
        </Card>
      </div>
    </Layout>
  );
}
