import Layout from "@/components/layout";
import { Heart, Activity, Apple, Dumbbell, Salad, Flame, CheckCircle2, AlertTriangle, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function HealthPage() {


  // Mock health score data - in a real app, this would come from an API
  const healthScore = {
    score: 82,
    maxScore: 100,
    status: "Good",
    lastUpdated: "2025-04-26",
    factors: [
      {
        type: "positive",
        icon: Activity,
        title: "Physical Activity",
        description: "Meeting daily exercise goals"
      },
      {
        type: "warning",
        icon: AlertTriangle,
        title: "Sleep Quality",
        description: "Average 6.5 hours per night"
      },
      {
        type: "positive",
        icon: CheckCircle2,
        title: "Nutrition",
        description: "Balanced diet with good variety"
      }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  const healthCategories = [
    {
      title: "Physical Fitness",
      description: "Track your workouts and fitness goals",
      icon: Dumbbell,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Mental Wellness",
      description: "Resources for mental health and mindfulness",
      icon: Heart,
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Medical History",
      description: "Track medical records, appointments, and health conditions",
      icon: Stethoscope,
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "Nutrition",
      description: "Healthy recipes and dietary advice",
      icon: Apple,
      color: "from-red-500 to-orange-600"
    },
    {
      title: "Lifestyle",
      description: "Tips for a balanced and healthy lifestyle",
      icon: Activity,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Meal Planning",
      description: "Plan and track your meals",
      icon: Salad,
      color: "from-yellow-500 to-amber-600"
    }
  ];

  return (
    <Layout>
          <div className="max-w-6xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Health & Wellness
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your journey to a healthier lifestyle starts here
            </p>
          </div>

          {/* Health Score Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Flame className="h-6 w-6 text-primary" />
                    Health & Fitness Score
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {healthScore.lastUpdated}</p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(healthScore.score)}`}>
                    {healthScore.score}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">out of {healthScore.maxScore}</div>
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
                    style={{ left: `${(healthScore.score / healthScore.maxScore) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0</span>
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                  <span>100</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {healthScore.factors.map((factor) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthCategories.map((category) => (
              <Card key={category.title} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 text-white`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{category.description}</p>
                  <button className="mt-4 text-sm font-medium text-primary hover:underline inline-flex items-center">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </Card>
            ))}
          </div>
          </div>
    </Layout>
  );
}
