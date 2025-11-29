# 📧 Email Service Integration for Blitz

Complete guide to integrating email services with your Blitz platform (Railway + Vercel).

---

## 🎯 Why Use Third-Party Email Services?

**Railway & Vercel both recommend API-based email services because:**
- ✅ Better deliverability (dedicated IPs, reputation management)
- ✅ Analytics & tracking built-in
- ✅ No SMTP timeout issues in serverless
- ✅ Professional features (templates, scheduling, etc.)
- ✅ Generous free tiers

---

## 📊 Service Comparison

| Service | Free Tier | Paid Start | Best For | Integration |
|---------|-----------|------------|----------|-------------|
| **Resend** | 3k/month, 100/day | $20/50k | Next.js, Dev Experience | Official Vercel |
| **SendGrid** | 100/day | $15/50k | Reliability, Scale | Easy |
| **Mailgun** | 5k/month (3mo) | $35/50k | Developers, API | Easy |
| **Postmark** | 100/month | $15/10k | Deliverability | Easy |
| **Brevo** | 300/day | $25/unlimited | Marketing + Trans | Easy |

---

## 🚀 Option 1: Resend (Recommended)

### Why Resend?
- Built specifically for Next.js/React developers
- Official Vercel integration
- React Email support (beautiful email templates)
- Best developer experience
- 3,000 free emails/month

### Setup Steps

#### 1. Create Resend Account
```bash
# Sign up at https://resend.com
# Verify your domain (or use onboarding@resend.dev for testing)
```

#### 2. Install Package
```bash
npm install resend
```

#### 3. Get API Key
1. Go to https://resend.com/api-keys
2. Create new API key
3. Copy the key (starts with `re_`)

#### 4. Add to Environment Variables

**Railway Backend:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Vercel Frontend:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

#### 5. Backend Implementation (Railway)

**File: `app/services/email_service.py`**

```python
import os
import requests
from typing import List, Optional

class ResendEmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.base_url = "https://api.resend.com/emails"
        
    def send_launch_email(
        self,
        to: str,
        audience_type: str,
        subject: Optional[str] = None
    ) -> dict:
        """Send launch notification email"""
        
        # Email content based on audience type
        templates = {
            "product-dev": {
                "subject": "🎉 Blitz is Live - Get Your Products Promoted!",
                "html": self._get_product_dev_template()
            },
            "affiliate": {
                "subject": "💰 Blitz is Live - Start Earning Today!",
                "html": self._get_affiliate_template()
            },
            "business": {
                "subject": "🚀 Blitz is Live - AI Marketing at Your Fingertips!",
                "html": self._get_business_template()
            }
        }
        
        template = templates.get(audience_type, templates["affiliate"])
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Blitz <launch@yourdomain.com>",  # Use your verified domain
            "to": [to],
            "subject": subject or template["subject"],
            "html": template["html"]
        }
        
        response = requests.post(
            self.base_url,
            headers=headers,
            json=payload
        )
        
        return response.json()
    
    def send_welcome_email(self, to: str, name: str = None) -> dict:
        """Send welcome email to new signups"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Blitz <hello@yourdomain.com>",
            "to": [to],
            "subject": "Welcome to Blitz! 🎉",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Welcome to Blitz!</h1>
                <p>Hi{f' {name}' if name else ''},</p>
                <p>Thanks for joining our waitlist! We're excited to have you on board.</p>
                <p>We'll notify you as soon as Blitz launches. In the meantime:</p>
                <ul>
                    <li>Follow us on Twitter for updates</li>
                    <li>Join our Discord community</li>
                    <li>Check out our blog for tips</li>
                </ul>
                <p>See you soon!</p>
                <p>— The Blitz Team</p>
            </div>
            """
        }
        
        response = requests.post(
            self.base_url,
            headers=headers,
            json=payload
        )
        
        return response.json()
    
    def _get_product_dev_template(self) -> str:
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #8b5cf6;">🎯 Blitz is Live!</h1>
                <p>Great news! Blitz is officially launched and ready for your products.</p>
                <p><strong>What you can do now:</strong></p>
                <ul>
                    <li>Add your products in 2 minutes</li>
                    <li>Get instant AI-powered intelligence</li>
                    <li>Access our network of affiliate marketers</li>
                    <li>Track performance in real-time</li>
                </ul>
                <a href="https://blitz.com/login" style="display: inline-block; background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Get Started →
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Questions? Reply to this email or visit our help center.
                </p>
            </div>
        </div>
        """
    
    def _get_affiliate_template(self) -> str:
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #10b981;">💰 Blitz is Live!</h1>
                <p>Start creating AI-powered campaigns and earning commissions today!</p>
                <p><strong>What's waiting for you:</strong></p>
                <ul>
                    <li>Browse hundreds of products to promote</li>
                    <li>Generate content in minutes with AI</li>
                    <li>Create images, articles, emails, and more</li>
                    <li>Track your earnings in real-time</li>
                </ul>
                <a href="https://blitz.com/login" style="display: inline-block; background: linear-gradient(to right, #10b981, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Start Earning →
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Questions? Reply to this email or join our Discord community.
                </p>
            </div>
        </div>
        """
    
    def _get_business_template(self) -> str:
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #3b82f6;">🚀 Blitz is Live!</h1>
                <p>Your AI marketing team is ready to work!</p>
                <p><strong>Start growing your business:</strong></p>
                <ul>
                    <li>Generate professional content instantly</li>
                    <li>Access AI-powered marketing campaigns</li>
                    <li>Connect with affiliate marketers</li>
                    <li>Save $150k+/year vs agencies</li>
                </ul>
                <a href="https://blitz.com/login" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Launch Your Campaigns →
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Need help? Reply to this email or schedule a demo.
                </p>
            </div>
        </div>
        """

# Usage in your signup endpoint
email_service = ResendEmailService()

@app.post("/api/signup")
async def create_signup(signup: EmailSignupCreate, db: Session = Depends(get_db)):
    # ... create signup logic ...
    
    # Send welcome email
    try:
        email_service.send_welcome_email(signup.email)
    except Exception as e:
        # Log error but don't fail the signup
        print(f"Failed to send welcome email: {e}")
    
    return db_signup
```

#### 6. Frontend Implementation (Vercel)

**File: `app/api/send-email/route.ts`**

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Blitz <hello@yourdomain.com>',
      to: [email],
      subject: 'Welcome to Blitz! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Blitz!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Thanks for joining our waitlist!</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

---

## 🔧 Option 2: SendGrid

### Setup Steps

#### 1. Create Account
- Sign up at https://sendgrid.com
- Verify your email
- Complete sender verification

#### 2. Get API Key
1. Go to Settings → API Keys
2. Create API Key with "Full Access"
3. Copy key (starts with `SG.`)

#### 3. Install Package
```bash
pip install sendgrid
```

#### 4. Backend Implementation

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

class SendGridEmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.sg = SendGridAPIClient(self.api_key)
        
    def send_launch_email(self, to: str, audience_type: str):
        """Send launch notification"""
        
        templates = {
            "product-dev": {
                "subject": "🎉 Blitz is Live - Get Your Products Promoted!",
                "content": "HTML content here..."
            },
            "affiliate": {
                "subject": "💰 Blitz is Live - Start Earning Today!",
                "content": "HTML content here..."
            },
            "business": {
                "subject": "🚀 Blitz is Live!",
                "content": "HTML content here..."
            }
        }
        
        template = templates.get(audience_type, templates["affiliate"])
        
        message = Mail(
            from_email=Email("launch@yourdomain.com", "Blitz"),
            to_emails=To(to),
            subject=template["subject"],
            html_content=Content("text/html", template["content"])
        )
        
        try:
            response = self.sg.send(message)
            return {
                "status_code": response.status_code,
                "success": True
            }
        except Exception as e:
            print(f"SendGrid error: {e}")
            return {"success": False, "error": str(e)}
    
    def send_bulk_emails(self, recipients: list, subject: str, content: str):
        """Send to multiple recipients"""
        
        message = Mail(
            from_email=Email("hello@yourdomain.com", "Blitz"),
            to_emails=[To(email) for email in recipients],
            subject=subject,
            html_content=Content("text/html", content)
        )
        
        try:
            response = self.sg.send(message)
            return {"success": True, "status_code": response.status_code}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Environment variable
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
```

---

## 📮 Option 3: Mailgun

### Setup Steps

#### 1. Create Account
- Sign up at https://mailgun.com
- Verify domain or use sandbox domain for testing

#### 2. Get API Key
1. Go to Settings → API Keys
2. Copy your "Private API key"

#### 3. Install Package
```bash
pip install requests  # Mailgun uses simple HTTP API
```

#### 4. Backend Implementation

```python
import os
import requests

class MailgunEmailService:
    def __init__(self):
        self.api_key = os.getenv("MAILGUN_API_KEY")
        self.domain = os.getenv("MAILGUN_DOMAIN")  # e.g., "mg.yourdomain.com"
        self.base_url = f"https://api.mailgun.net/v3/{self.domain}"
        
    def send_launch_email(self, to: str, audience_type: str):
        """Send launch notification"""
        
        templates = {
            "product-dev": {
                "subject": "🎉 Blitz is Live!",
                "html": "HTML content..."
            }
        }
        
        template = templates.get(audience_type, templates["affiliate"])
        
        response = requests.post(
            f"{self.base_url}/messages",
            auth=("api", self.api_key),
            data={
                "from": "Blitz <launch@yourdomain.com>",
                "to": [to],
                "subject": template["subject"],
                "html": template["html"]
            }
        )
        
        return response.json()
    
    def send_batch_emails(self, recipients: list, subject: str, html: str):
        """Send to multiple recipients (up to 1000 per request)"""
        
        # Mailgun supports recipient variables for personalization
        response = requests.post(
            f"{self.base_url}/messages",
            auth=("api", self.api_key),
            data={
                "from": "Blitz <hello@yourdomain.com>",
                "to": recipients,
                "subject": subject,
                "html": html
            }
        )
        
        return response.json()

# Environment variables
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
```

---

## 🎨 Using React Email (with Resend)

For beautiful, maintainable email templates:

```bash
npm install react-email @react-email/components
```

**Create email template: `emails/WelcomeEmail.tsx`**

```typescript
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name?: string;
  audienceType: 'product-dev' | 'affiliate' | 'business';
}

export default function WelcomeEmail({ name, audienceType }: WelcomeEmailProps) {
  const content = {
    'product-dev': {
      title: '🎯 Get Your Products Promoted',
      message: 'Access our network of affiliate marketers ready to promote your products.',
    },
    'affiliate': {
      title: '💰 Start Earning Today',
      message: 'Browse products and create AI-powered campaigns in minutes.',
    },
    'business': {
      title: '🚀 Your AI Marketing Team',
      message: 'Generate professional content and grow your business on autopilot.',
    },
  };

  const { title, message } = content[audienceType];

  return (
    <Html>
      <Head />
      <Preview>Welcome to Blitz - {title}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px' }}>
            <Text style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
              Welcome to Blitz!
            </Text>
            <Text style={{ fontSize: '18px', color: '#374151' }}>
              Hi {name || 'there'} 👋
            </Text>
            <Text style={{ fontSize: '16px', color: '#6b7280', lineHeight: '24px' }}>
              {message}
            </Text>
            <Button
              href="https://blitz.com/login"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '20px',
              }}
            >
              Get Started →
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

**Use in API route:**

```typescript
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Blitz <hello@yourdomain.com>',
  to: email,
  subject: 'Welcome to Blitz!',
  react: WelcomeEmail({ name: 'John', audienceType: 'affiliate' }),
});
```

---

## 📊 Integration Comparison

### Quick Setup (Fastest)
1. **Resend** - 5 minutes with Vercel integration
2. **Mailgun** - 10 minutes via API
3. **SendGrid** - 15 minutes (more setup steps)

### Best Free Tier
1. **Resend** - 3,000/month
2. **SendGrid** - 100/day (3,000/month)
3. **Mailgun** - 5,000/month (first 3 months only)

### Best for Scale
1. **SendGrid** - Enterprise-grade
2. **Mailgun** - Developer-friendly at scale
3. **Resend** - Growing fast

---

## 🚀 Implementation Checklist

### For MiniMax

- [ ] Choose email service (recommend Resend for speed)
- [ ] Create account and get API key
- [ ] Add API key to Railway environment variables
- [ ] Add API key to Vercel environment variables
- [ ] Implement email service in backend
- [ ] Test welcome email on signup
- [ ] Create email templates for each audience type
- [ ] Test launch email sending
- [ ] Set up email tracking/analytics
- [ ] Configure sending domain (for production)

---

## 💡 Pro Tips

1. **Start with Resend** - Fastest setup, great DX, generous free tier
2. **Use React Email** - Maintainable, version-controlled email templates
3. **Test with dev emails first** - All services offer sandbox/test modes
4. **Track opens/clicks** - Built into all these services
5. **Set up SPF/DKIM** - For better deliverability (each service guides you)
6. **Batch sends for launch** - Don't send 1000 emails one-by-one

---

## 🔗 Useful Links

- Resend Docs: https://resend.com/docs
- SendGrid Docs: https://docs.sendgrid.com
- Mailgun Docs: https://documentation.mailgun.com
- React Email: https://react.email
- Vercel Email Guide: https://vercel.com/guides/sending-emails

---

## ✅ Recommendation for Blitz

**Use Resend because:**
1. ✅ Best developer experience
2. ✅ Official Vercel integration (1-click setup)
3. ✅ React Email support (beautiful templates)
4. ✅ 3,000 free emails/month
5. ✅ Built for modern JavaScript apps
6. ✅ Excellent documentation
7. ✅ Fast setup (5-10 minutes total)

**Estimated Implementation Time:** 30 minutes to 1 hour

You're all set to send emails! 📧✨