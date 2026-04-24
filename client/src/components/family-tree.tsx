import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users } from "lucide-react";

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  profilePicture?: string;
  birthYear?: number;
  children?: FamilyMember[];
}

interface FamilyTreeProps {
  familyData: FamilyMember;
}

function FamilyMemberCard({ member }: { member: FamilyMember }) {
  return (
    <Card className="w-48 p-4 bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={member.profilePicture} alt={member.name} />
          <AvatarFallback className="bg-primary/10">
            {member.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-sm text-center">{member.name}</h3>
        <p className="text-xs text-gray-500 text-center">{member.relationship}</p>
        {member.birthYear && (
          <p className="text-xs text-gray-400 mt-1">Born {member.birthYear}</p>
        )}
      </div>
    </Card>
  );
}

export default function FamilyTree({ familyData }: FamilyTreeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Family Tree</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"} Tree
        </Button>
      </div>

      <div className={`transition-all duration-300 ${isExpanded ? "h-auto" : "h-[300px]"} overflow-hidden`}>
        <div className="relative w-full min-h-[300px] p-4">
          {/* Tree Structure */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Root (Current User) */}
              <div className="flex justify-center">
                <FamilyMemberCard member={familyData} />
              </div>

              {/* Parents Level */}
              {familyData.children && familyData.children.length > 0 && (
                <>
                  <div className="absolute left-1/2 top-24 h-8 w-px bg-gray-300" />
                  <div className="absolute top-32 left-1/2 -translate-x-1/2">
                    <div className="flex gap-8 items-center">
                      <div className="relative">
                        <div className="absolute top-0 left-1/2 h-8 w-px bg-gray-300 -translate-x-1/2 -translate-y-full" />
                        {familyData.children.map((child, index) => (
                          <div key={child.id} className="relative">
                            <FamilyMemberCard member={child} />
                            {index < familyData.children!.length - 1 && (
                              <div className="absolute top-1/2 right-0 h-px w-8 bg-gray-300 translate-x-full" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Add Family Member Button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Family Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
