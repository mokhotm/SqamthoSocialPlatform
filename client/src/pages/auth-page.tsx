import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { SouthAfricanPattern, SouthAfricanAccent } from "@/components/ui/south-african-pattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form with extended schema
  const registerForm = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      bio: "",
      location: "",
      profilePicture: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginUserSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerUserSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 sa-pattern-bg">
      
      {/* Left column - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary font-poppins tracking-wide">Sqamtho</h1>
            <div className="h-1 w-12 bg-gradient-to-r from-primary via-accent to-secondary mx-auto my-3 rounded-full"></div>
            <p className="mt-2 text-sm text-gray-600">
              Connect with friends and the South African community
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-primary/5 p-1 rounded-lg">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                Register
              </TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-100">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-gray-700">Password</FormLabel>
                            <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="Enter your password" 
                                className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 pr-10"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showLoginPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in to your account"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">New to Sqamtho?</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/5"
                      onClick={() => setActiveTab("register")}
                    >
                      Create a new account
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-100">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:gap-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-gray-700">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-gray-700">Display Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-5 sm:flex-row sm:gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-gray-700">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showRegisterPassword ? "text" : "password"}
                                  placeholder="Create a password" 
                                  className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 pr-10"
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showRegisterPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password" 
                                  className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 pr-10"
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="bio"
                      render={({ field }) => {
                        const { value, ...restField } = field;
                        return (
                          <FormItem>
                            <FormLabel className="text-gray-700">Bio (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Tell us about yourself" 
                                className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                                {...restField} 
                                value={value || ""} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="location"
                      render={({ field }) => {
                        const { value, ...restField } = field;
                        return (
                          <FormItem>
                            <FormLabel className="text-gray-700">Location (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your city or province" 
                                className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                                {...restField} 
                                value={value || ""} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="profilePicture"
                      render={({ field }) => {
                        const { value, ...restField } = field;
                        return (
                          <FormItem>
                            <FormLabel className="text-gray-700">Profile Picture (Optional)</FormLabel>
                            <FormControl>
                              <FileUpload 
                                onFileSelect={(fileData) => {
                                  field.onChange(fileData || "");
                                }}
                                defaultValue={value || ""}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating your account...
                          </>
                        ) : (
                          "Join Sqamtho today"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/5"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in to your account
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right column - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-white to-primary/5 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative overflow-hidden">
        <SouthAfricanPattern className="absolute top-0 left-0 right-0 h-4" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-3xl -mr-20 -mb-20"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">South Africa's Premier Social Network</span>
            <h1 className="text-5xl font-bold text-gray-900 font-poppins leading-tight">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Sqamtho</span></h1>
            <div className="h-1.5 w-20 bg-gradient-to-r from-primary via-accent to-secondary my-6 rounded-full"></div>
            <p className="mt-4 text-xl text-gray-600 leading-relaxed">
              Connect with friends, share moments, and build communities in an authentic South African experience.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/70 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Connect with Friends</h2>
                <p className="mt-1 text-gray-600">Build relationships, share updates, and stay connected with your community across South Africa.</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-br from-secondary to-secondary/70 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Real-time Messaging</h2>
                <p className="mt-1 text-gray-600">Instantly chat with friends, create group conversations, and share media seamlessly.</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-br from-accent to-accent/70 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Join Communities</h2>
                <p className="mt-1 text-gray-600">Find local groups that match your interests and connect with like-minded South Africans.</p>
              </div>
            </div>

            <div className="flex items-start p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600/70 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Money Management</h2>
                <p className="mt-1 text-gray-600">Track your finances, manage subscriptions, and achieve your financial goals with our comprehensive tools.</p>
              </div>
            </div>

            <div className="flex items-start p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600/70 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Health & Wellness</h2>
                <p className="mt-1 text-gray-600">Monitor your health metrics, track your fitness journey, and access wellness resources tailored for South Africans.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-1 text-primary/80 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>2,350+ users have joined Sqamtho today</span>
            </div>
            <div className="mt-4 text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Sqamtho · South Africa's Social Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
