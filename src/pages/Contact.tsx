import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    country: '',
    message: '',
    contactRole: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.message) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get client info for logging
      const userAgent = navigator.userAgent;
      
      // Insert contact data into Supabase
      const { error } = await supabase
        .from('contacts')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company: formData.company,
          job_title: formData.jobTitle || null,
          country: formData.country || null,
          contact_role: formData.contactRole || null,
          message: formData.message,
          user_agent: userAgent,
        });

      if (error) {
        console.error('Error submitting contact form:', error);
        toast({
          title: "문의 접수 중 오류가 발생했습니다",
          description: "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      // Send to Make.com webhook for email processing
      try {
        await fetch('https://hook.us2.make.com/34rk7u1kfz5axplpo7j5v1viuwgvzvkx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            company: formData.company,
            job_title: formData.jobTitle,
            country: formData.country,
            contact_role: formData.contactRole,
            message: formData.message,
          }),
        });
      } catch (webhookError) {
        console.error('Error sending to Make.com webhook:', webhookError);
        // Don't show error to user since main form submission succeeded
      }
      
      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 연락드리겠습니다.",
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        jobTitle: '',
        country: '',
        message: '',
        contactRole: ''
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
              주식회사 에이치큐테크
            </h1>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')}>홈</Button>
              <Button variant="ghost" onClick={() => navigate('/board')}>게시판</Button>
              <Button variant="ghost" onClick={() => navigate('/auth')}>로그인</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              주식회사 에이치큐테크는 전문적인 솔루션을 제공하여 가장 복잡한 과제를 해결합니다.
              궁금한 사항이나 프로젝트에 대해 문의해주세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>연락처 정보</CardTitle>
                  <CardDescription>
                    다양한 방법으로 연락해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">전화</p>
                      <p className="text-muted-foreground">031-8067-7870</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Printer className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">팩스</p>
                      <p className="text-muted-foreground">0504-405-1742</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">이메일</p>
                      <p className="text-muted-foreground">contact@hq-tech.co.kr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">운영시간</p>
                      <p className="text-muted-foreground">
                        월-금: 09:00 - 18:00<br />
                        토-일: 휴무
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>문의하기</CardTitle>
                  <CardDescription>
                    프로젝트나 서비스에 대해 문의해주시면 전문가가 연락드리겠습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">이름 *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="이름을 입력해주세요"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">성 *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="성을 입력해주세요"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">이메일 *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="이메일을 입력해주세요"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">회사명 *</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="회사명을 입력해주세요"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">직책</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                          placeholder="직책을 입력해주세요"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactRole">문의 유형</Label>
                        <Select value={formData.contactRole} onValueChange={(value) => handleInputChange('contactRole', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="문의 유형을 선택해주세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">일반 문의</SelectItem>
                            <SelectItem value="technical">기술 지원</SelectItem>
                            <SelectItem value="partnership">파트너십</SelectItem>
                            <SelectItem value="sales">영업 문의</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">국가/지역</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="국가/지역을 선택해주세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="korea">대한민국</SelectItem>
                            <SelectItem value="usa">미국</SelectItem>
                            <SelectItem value="japan">일본</SelectItem>
                            <SelectItem value="china">중국</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">메시지 *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="문의 내용을 자세히 입력해주세요"
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>
                        문의를 제출하시면 개인정보 처리방침에 따라 정보가 사용되고 저장되는데 동의하는 것으로 간주됩니다.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      문의 보내기
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;