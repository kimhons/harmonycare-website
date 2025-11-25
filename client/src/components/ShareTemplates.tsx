import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Check, 
  Mail, 
  Linkedin, 
  Twitter, 
  Facebook,
  Share2,
  Image as ImageIcon,
  Download
} from "lucide-react";
import { toast } from "sonner";
import {
  EMAIL_TEMPLATES,
  LINKEDIN_TEMPLATES,
  TWITTER_TEMPLATES,
  FACEBOOK_TEMPLATES,
  generateShareContent,
  generatePlatformShareUrl,
  type ShareTemplate,
  type ShareTemplateVariables,
} from "@/../../shared/shareTemplates";

interface ShareTemplatesProps {
  variables: ShareTemplateVariables;
}

export default function ShareTemplates({ variables }: ShareTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplate | null>(null);
  const [customizedContent, setCustomizedContent] = useState<string>("");
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleSelectTemplate = (template: ShareTemplate) => {
    setSelectedTemplate(template);
    const content = generateShareContent(template, variables);
    setCustomizedContent(content);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
    toast.success("Copied to clipboard!");
  };

  const handleShare = (template: ShareTemplate, content: string) => {
    const shareUrl = generatePlatformShareUrl(template.platform, content, variables.referralLink);
    
    if (template.platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    toast.success(`Opening ${template.platform} share dialog...`);
  };

  const handleDownloadImage = (tier: string) => {
    const tierLower = tier.toLowerCase().replace(' ', '-');
    const imagePath = `/share-graphics/social-card-${tierLower}.png`;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = `harmonycare-${tierLower}-badge.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Downloading social media graphic...");
  };

  const getPlatformIcon = (platform: ShareTemplate['platform']) => {
    switch (platform) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: ShareTemplate['platform']) => {
    switch (platform) {
      case 'email':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'linkedin':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'twitter':
        return 'bg-sky-500 hover:bg-sky-600';
      case 'facebook':
        return 'bg-blue-700 hover:bg-blue-800';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const renderTemplateCard = (template: ShareTemplate) => {
    const content = generateShareContent(template, variables);
    const isSelected = selectedTemplate?.id === template.id;
    const isCopied = copiedStates[template.id];

    return (
      <Card 
        key={template.id}
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
        }`}
        onClick={() => handleSelectTemplate(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getPlatformIcon(template.platform)}
              <CardTitle className="text-base">{template.title}</CardTitle>
            </div>
            <Badge variant="outline" className="capitalize">
              {template.platform}
            </Badge>
          </div>
          <CardDescription className="text-sm">{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-md p-3 text-sm max-h-32 overflow-y-auto">
              {content.substring(0, 150)}...
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(content, template.id);
                }}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className={`flex-1 ${getPlatformColor(template.platform)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(template, content);
                }}
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Social Media Graphics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Branded Social Media Graphics
          </CardTitle>
          <CardDescription>
            Download professional graphics to attach to your social media posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Generic Card */}
            <div className="space-y-2">
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <img
                  src="/share-graphics/social-card-generic.png"
                  alt="Generic HarmonyCare Share Card"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleDownloadImage('generic')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Generic
              </Button>
            </div>

            {/* Current Tier Card */}
            {variables.tier && (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden border ring-2 ring-primary">
                  <img
                    src={`/share-graphics/social-card-${variables.tier.toLowerCase().replace(' ', '-')}.png`}
                    alt={`${variables.tier} Tier Badge`}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2">Your Tier</Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownloadImage(variables.tier)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {variables.tier}
                </Button>
              </div>
            )}

            {/* Info Card */}
            <div className="flex flex-col justify-center p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground mb-2">
                💡 <strong>Pro Tip:</strong> Attach these graphics to your social media posts for maximum impact!
              </p>
              <p className="text-xs text-muted-foreground">
                Optimized for LinkedIn, Twitter, and Facebook (1200x630px)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Share Templates</CardTitle>
          <CardDescription>
            Choose a pre-written template and customize it for your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </TabsTrigger>
              <TabsTrigger value="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EMAIL_TEMPLATES.map(renderTemplateCard)}
              </div>
            </TabsContent>

            <TabsContent value="linkedin" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LINKEDIN_TEMPLATES.map(renderTemplateCard)}
              </div>
            </TabsContent>

            <TabsContent value="twitter" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TWITTER_TEMPLATES.map(renderTemplateCard)}
              </div>
            </TabsContent>

            <TabsContent value="facebook" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FACEBOOK_TEMPLATES.map(renderTemplateCard)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Customization Panel */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Message</CardTitle>
            <CardDescription>
              Edit the template to match your voice and add personal touches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Your Customized Content</label>
                {selectedTemplate.characterLimit && (
                  <span className="text-xs text-muted-foreground">
                    {customizedContent.length} / {selectedTemplate.characterLimit} characters
                  </span>
                )}
              </div>
              <Textarea
                value={customizedContent}
                onChange={(e) => setCustomizedContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Edit your message here..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCopy(customizedContent, 'custom')}
              >
                {copiedStates['custom'] ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                className={`flex-1 ${getPlatformColor(selectedTemplate.platform)}`}
                onClick={() => handleShare(selectedTemplate, customizedContent)}
              >
                {getPlatformIcon(selectedTemplate.platform)}
                <span className="ml-2">Share on {selectedTemplate.platform}</span>
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>💡 Sharing Tip:</strong> Remember to attach your tier badge graphic when posting on social media for maximum engagement!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
