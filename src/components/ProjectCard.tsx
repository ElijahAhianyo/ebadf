import { useState } from "react";
import { ExternalLink, Github, Calendar, Users, Star } from "lucide-react";
import { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  showDescription?: boolean;
  className?: string;
}

export function ProjectCard({ project, showDescription = true, className }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* <Calendar className="h-4 w-4" /> */}
              {/* <span>{formatDate(project.date)}</span> */}
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getStatusColor(project.status))}
              >
                {project.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {project.githubUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => window.open(project.githubUrl, '_blank')}
              >
                <Github className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open(project.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showDescription && (
          <CardDescription className="text-sm leading-relaxed">
            {project.description}
          </CardDescription>
        )}

        {project.impact && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{project.impact}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {project.category === 'opensource' && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Open Source</span>
              </div>
            )}
            {project.category === 'personal' && (
              <div className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>Personal Project</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => window.open(project.url, '_blank')}
          >
            View Project
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardFooter>

      {/* Hover effect overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none",
          isHovered && "opacity-100"
        )}
      />
    </Card>
  );
}
