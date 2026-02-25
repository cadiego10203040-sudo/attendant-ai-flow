
-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  segment TEXT DEFAULT '',
  language TEXT DEFAULT 'informal',
  logo_url TEXT DEFAULT '',
  address TEXT DEFAULT '',
  business_hours JSONB DEFAULT '{}',
  ai_instructions TEXT DEFAULT '',
  objections TEXT DEFAULT '',
  escalation_rules TEXT DEFAULT '',
  whatsapp_phone_id TEXT DEFAULT '',
  whatsapp_token TEXT DEFAULT '',
  whatsapp_verify_token TEXT DEFAULT '',
  openai_key TEXT DEFAULT '',
  mp_key TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own company" ON public.companies FOR DELETE USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  pix_link TEXT DEFAULT '',
  card_link TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company products" ON public.products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = products.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = products.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = products.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can delete products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = products.company_id AND companies.user_id = auth.uid())
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_name TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = conversations.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert conversations" ON public.conversations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = conversations.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update conversations" ON public.conversations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = conversations.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can delete conversations" ON public.conversations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = conversations.company_id AND companies.user_id = auth.uid())
);

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.companies co ON co.id = c.company_id
    WHERE c.id = messages.conversation_id AND co.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.companies co ON co.id = c.company_id
    WHERE c.id = messages.conversation_id AND co.user_id = auth.uid()
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL DEFAULT 0,
  link_sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = orders.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = orders.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = orders.company_id AND companies.user_id = auth.uid())
);

-- Create quick_replies table
CREATE TABLE public.quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shortcut TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their quick replies" ON public.quick_replies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = quick_replies.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert quick replies" ON public.quick_replies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = quick_replies.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update quick replies" ON public.quick_replies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = quick_replies.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can delete quick replies" ON public.quick_replies FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = quick_replies.company_id AND companies.user_id = auth.uid())
);

-- Create labels table
CREATE TABLE public.labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#FF6B2B',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their labels" ON public.labels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = labels.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert labels" ON public.labels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = labels.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update labels" ON public.labels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = labels.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can delete labels" ON public.labels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = labels.company_id AND companies.user_id = auth.uid())
);

-- Create broadcasts table
CREATE TABLE public.broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  audience_filter JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their broadcasts" ON public.broadcasts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = broadcasts.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert broadcasts" ON public.broadcasts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = broadcasts.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update broadcasts" ON public.broadcasts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = broadcasts.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can delete broadcasts" ON public.broadcasts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = broadcasts.company_id AND companies.user_id = auth.uid())
);

-- Create flows table for conversation flows
CREATE TABLE public.flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  steps JSONB DEFAULT '[]',
  executions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their flows" ON public.flows FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = flows.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can insert flows" ON public.flows FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = flows.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can update flows" ON public.flows FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = flows.company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Users can delete flows" ON public.flows FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = flows.company_id AND companies.user_id = auth.uid())
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Users can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
