import Layout from "@/components/layout";
import { Wallet, LineChart, PiggyBank, TrendingUp, DollarSign, Shield, AlertTriangle, CheckCircle2, Receipt, Building2, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import SubscriptionsPage from "./subscriptions-page";

export default function MoneyPage() {
  const [showSubscriptions, setShowSubscriptions] = useState(false);


  const moneyCategories = [
    {
      title: "Budgeting",
      description: "Create and manage your monthly budget, track expenses, and set financial goals.",
      icon: Wallet,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Investments",
      description: "Explore investment opportunities, track portfolio performance, and learn about markets.",
      icon: TrendingUp,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Savings",
      description: "Set up savings goals, track your progress, and find ways to save more effectively.",
      icon: PiggyBank,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Tax Compliance",
      description: "Track tax obligations, manage documentation, and ensure compliance with tax regulations.",
      icon: Receipt,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Financial Reports",
      description: "View detailed reports of your income, expenses, and overall financial health.",
      icon: LineChart,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Transactions",
      description: "Monitor your recent transactions, categorize spending, and detect patterns.",
      icon: DollarSign,
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "Assets",
      description: "Track and manage your assets including property, vehicles, and investments.",
      icon: Building2,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Subscriptions",
      description: "Manage your recurring payments, track subscription costs, and get renewal reminders.",
      icon: CreditCard,
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  // Mock credit score data - in a real app, this would come from an API
  const creditScore = {
    score: 725,
    maxScore: 850,
    status: "Good",
    lastUpdated: "2025-04-26",
    factors: [
      {
        type: "positive",
        icon: CheckCircle2,
        title: "Payment History",
        description: "All payments made on time"
      },
      {
        type: "warning",
        icon: AlertTriangle,
        title: "Credit Utilization",
        description: "Currently at 35% of available credit"
      },
      {
        type: "positive",
        icon: CheckCircle2,
        title: "Credit Age",
        description: "Average account age: 6 years"
      }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-emerald-500";
    if (score >= 700) return "text-green-500";
    if (score >= 650) return "text-yellow-500";
    if (score >= 600) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Layout>
          <div className="max-w-6xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Money & Finance
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Take control of your financial future
            </p>
          </div>

          {/* Credit Score Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Credit Score
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {creditScore.lastUpdated}</p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(creditScore.score)}`}>
                    {creditScore.score}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">out of {creditScore.maxScore}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: '100%' }}
                  />
                  <div 
                    className="absolute top-0 h-full w-2 bg-white border-2 border-gray-700 rounded-full transform -translate-x-1/2"
                    style={{ left: `${(creditScore.score / creditScore.maxScore) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>300</span>
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                  <span>850</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {creditScore.factors.map((factor) => (
                  <div 
                    key={factor.title}
                    className={`p-4 rounded-lg border ${factor.type === 'positive' ? 'border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-900/20' : 'border-yellow-100 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <factor.icon className={`h-5 w-5 mt-0.5 ${factor.type === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                      <div>
                        <h3 className="font-medium text-sm">{factor.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{factor.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {moneyCategories.map((category, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => {
                  if (category.title === "Subscriptions") {
                    setShowSubscriptions(true);
                  }
                }}
              >
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${category.color}`} />
                <div className="p-6 relative">
                  <category.icon className={`h-12 w-12 mb-4 ${category.color.split(' ')[1]}`} />
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Subscriptions Dialog */}
          <Dialog open={showSubscriptions} onOpenChange={setShowSubscriptions}>
            <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Subscriptions</DialogTitle>
                <DialogDescription>
                  Track and manage your recurring payments, subscriptions, and memberships.
                </DialogDescription>
              </DialogHeader>
              <SubscriptionsPage embedded />
            </DialogContent>
          </Dialog>
          </div>
    </Layout>
  );
}
