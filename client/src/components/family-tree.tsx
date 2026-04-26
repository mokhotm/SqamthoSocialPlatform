import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, Move, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  profilePicture?: string;
  children?: FamilyMember[];
  spouse?: FamilyMember;
}

interface FamilyTreeProps {
  familyData: FamilyMember;
}

const FamilyMemberNode: React.FC<{ member: FamilyMember }> = ({ member }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <Card className="w-44 bg-white/40 dark:bg-black/40 backdrop-blur-md border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-md blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <Avatar className="h-14 w-14 relative rounded-md border border-white/30 dark:border-black/30 shadow-md">
                <AvatarImage src={member.profilePicture} alt={member.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600/80 text-white text-lg">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h4 className="font-bold text-sm bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate w-full">{member.name}</h4>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{member.relationship}</p>
          </CardContent>
        </Card>

        {member.spouse && (
          <>
            <div className="relative w-8 h-px bg-gradient-to-r from-primary/30 to-purple-500/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full shadow-sm shadow-red-400/50"></div>
            </div>
            <Card className="w-44 bg-white/40 dark:bg-black/40 backdrop-blur-md border-purple-500/10 shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-md blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <Avatar className="h-14 w-14 relative rounded-md border border-white/30 dark:border-black/30 shadow-md">
                    <AvatarImage src={member.spouse.profilePicture} alt={member.spouse.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600/80 to-pink-500/80 text-white text-lg">
                      {member.spouse.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h4 className="font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent truncate w-full">{member.spouse.name}</h4>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{member.spouse.relationship}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {member.children && member.children.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className="w-px h-8 bg-gradient-to-b from-primary/30 to-transparent" />
          <div className="flex gap-8 relative pt-3">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            {member.children.map((child) => (
              <FamilyMemberNode key={child.id} member={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FamilyTree: React.FC<FamilyTreeProps> = ({ familyData }) => {
  const [scale, setScale] = useState(1);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!familyData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No family data to display.
      </div>
    );
  }

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 2.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.3));
  const handleReset = () => {
    setScale(1);
    controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.min(Math.max(s + delta, 0.3), 2.5));
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl border border-primary/5 shadow-inner group"
      onWheel={handleWheel}
    >
      {/* Canvas Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }} 
      />

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-3">
        <div className="flex flex-col bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-lg border border-primary/10 p-1 shadow-xl">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomIn}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="h-px bg-primary/5 mx-1.5" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomOut}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="h-px bg-primary/5 mx-1.5" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Reset View"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-black/80 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg text-[9px] font-bold uppercase tracking-widest text-white dark:text-white/70 animate-in fade-in slide-in-from-right-2 duration-300">
          <Move className="h-3 w-3" />
          <span>Pan</span>
          <span className="mx-1 opacity-30">•</span>
          <MousePointer2 className="h-3 w-3" />
          <span>Ctrl+Scroll Zoom</span>
        </div>
      </div>

      {/* Tree Canvas */}
      <motion.div 
        drag
        animate={controls}
        initial={{ x: 0, y: 0 }}
        style={{ scale }}
        className="flex items-center justify-center min-w-full min-h-full p-[200px] cursor-grab active:cursor-grabbing"
      >
        <FamilyMemberNode member={familyData} />
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-md border border-primary/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;