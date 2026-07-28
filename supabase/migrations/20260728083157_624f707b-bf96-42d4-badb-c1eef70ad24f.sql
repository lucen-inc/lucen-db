
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto assign role on signup: first user = admin, else editor
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN is_first THEN 'admin'::public.app_role ELSE 'editor'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL UNIQUE,
  legal_name text,
  industry text NOT NULL,
  sub_industry text NOT NULL,
  hq text NOT NULL,
  country text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  employees integer NOT NULL DEFAULT 0,
  revenue text,
  founded integer,
  website text,
  description text,
  logo text,
  tags text[] NOT NULL DEFAULT '{}',
  parent_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  score_lead integer NOT NULL DEFAULT 50 CHECK (score_lead BETWEEN 0 AND 100),
  score_innovation integer NOT NULL DEFAULT 50 CHECK (score_innovation BETWEEN 0 AND 100),
  score_luxury integer NOT NULL DEFAULT 50 CHECK (score_luxury BETWEEN 0 AND 100),
  score_tech integer NOT NULL DEFAULT 50 CHECK (score_tech BETWEEN 0 AND 100),
  score_priority integer NOT NULL DEFAULT 50 CHECK (score_priority BETWEEN 0 AND 100),
  client_status text NOT NULL DEFAULT 'Prospect',
  stage text NOT NULL DEFAULT 'Prospect',
  owner text,
  locations integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Editors and admins can insert"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors and admins can update"
ON public.organizations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Only admins can delete"
ON public.organizations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Normalized name helper
CREATE OR REPLACE FUNCTION public.normalize_org_name(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(regexp_replace(coalesce(_name, ''), '[^a-zA-Z0-9]+', '', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.set_organizations_normalized_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_name := public.normalize_org_name(NEW.name);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_set_normalized_name
BEFORE INSERT OR UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.set_organizations_normalized_name();

-- Seed data
INSERT INTO public.organizations (name, normalized_name, legal_name, industry, sub_industry, hq, country, countries, employees, revenue, founded, website, description, logo, tags, score_lead, score_innovation, score_luxury, score_tech, score_priority, client_status, stage, owner, locations) VALUES
('Emaar Properties', 'emaarproperties', 'Emaar Properties PJSC', 'Real Estate', 'Mixed-Use Developer', 'Dubai', 'UAE', ARRAY['UAE','Saudi Arabia','Egypt','Turkey','India'], 4200, '$7.9B', 1997, 'emaar.com', 'Master developer behind Burj Khalifa, Dubai Mall and Downtown Dubai. Anchor property platform in the region.', 'EM', ARRAY['Flagship','Luxury','High Priority'], 92, 78, 96, 74, 95, 'Active Client', 'Won', 'N. Al Mansouri', 38),
('Dubai Airports', 'dubaiairports', NULL, 'Aviation', 'Airport Authority', 'Dubai', 'UAE', ARRAY['UAE'], 3100, '$2.4B', 1960, 'dubaiairports.ae', 'Operator of DXB and DWC. Handles 92M+ annual passengers with major experiential retail programme.', 'DXB', ARRAY['Airport','Innovation','Existing Client'], 88, 91, 82, 90, 93, 'Active Client', 'Negotiation', 'R. Kaur', 2),
('LVMH', 'lvmh', 'LVMH Moët Hennessy Louis Vuitton SE', 'Luxury', 'Conglomerate', 'Paris', 'France', ARRAY['France','Italy','USA','Japan','UAE','China'], 213000, '$86.2B', 1987, 'lvmh.com', 'Parent to 75 maisons across fashion, jewellery, wines & spirits and selective retailing.', 'LV', ARRAY['Luxury','Global','Priority'], 84, 82, 100, 76, 91, 'Prospect', 'Proposal', 'N. Al Mansouri', 6100),
('Louis Vuitton', 'louisvuitton', NULL, 'Luxury', 'Fashion & Leather', 'Paris', 'France', ARRAY['France','USA','Japan','China','UAE'], 38000, '$25.4B', 1854, 'louisvuitton.com', 'Flagship maison of LVMH. Aggressive flagship & experiential retail rollout across MENA.', 'LV', ARRAY['Luxury','Retail','Flagship'], 89, 85, 100, 79, 94, 'Prospect', 'Meeting', 'N. Al Mansouri', 460),
('Qatar Investment Authority', 'qatarinvestmentauthority', NULL, 'Banking', 'Sovereign Wealth', 'Doha', 'Qatar', ARRAY['Qatar','UK','USA','France'], 800, '$475B AUM', 2005, 'qia.qa', 'Sovereign wealth fund with major stakes in luxury, real estate and hospitality globally.', 'QIA', ARRAY['Sovereign','Priority'], 76, 65, 88, 71, 84, 'Prospect', 'Qualified', 'R. Kaur', 4),
('NEOM', 'neom', NULL, 'Real Estate', 'Giga-project', 'Tabuk', 'Saudi Arabia', ARRAY['Saudi Arabia'], 2400, '$500B budget', 2017, 'neom.com', 'Saudi giga-project spanning The Line, Trojena, Sindalah and Oxagon. Deep innovation appetite.', 'NM', ARRAY['Giga','Innovation','High Priority'], 90, 100, 92, 96, 98, 'Prospect', 'Proposal', 'N. Al Mansouri', 5),
('Marriott International', 'marriottinternational', NULL, 'Hospitality', 'Hotel Group', 'Bethesda', 'USA', ARRAY['USA','UAE','UK','France','Japan'], 411000, '$23.7B', 1927, 'marriott.com', 'Largest hotel operator by rooms. Portfolio spans Ritz-Carlton, EDITION, W and St. Regis.', 'MR', ARRAY['Hospitality','Luxury'], 71, 68, 84, 73, 78, 'Past Client', 'Prospect', 'L. Fischer', 8500),
('Apple', 'apple', NULL, 'Technology', 'Consumer Electronics', 'Cupertino', 'USA', ARRAY['USA','UAE','China','Japan','UK','France'], 164000, '$383B', 1976, 'apple.com', 'Retail experience benchmark. Global flagship rollout with heavy investment in in-store experience.', 'AP', ARRAY['Tech','Retail','Flagship'], 82, 100, 88, 100, 89, 'Prospect', 'Qualified', 'L. Fischer', 520),
('Meraas', 'meraas', NULL, 'Real Estate', 'Developer', 'Dubai', 'UAE', ARRAY['UAE'], 1600, '$3.1B', 2007, 'meraas.com', 'Developer of City Walk, La Mer, Bluewaters and Ain Dubai. Strong experiential retail focus.', 'MR', ARRAY['Developer','Retail'], 81, 84, 86, 78, 85, 'Active Client', 'Won', 'R. Kaur', 14),
('Hamad International Airport', 'hamadinternationalairport', NULL, 'Aviation', 'Airport', 'Doha', 'Qatar', ARRAY['Qatar'], 6200, '$1.9B', 2014, 'dohahamadairport.com', 'Award-winning airport with landmark art installations and high experiential retail spend.', 'HIA', ARRAY['Airport','Luxury','Innovation'], 79, 88, 90, 85, 86, 'Prospect', 'Meeting', 'R. Kaur', 1),
('Public Investment Fund', 'publicinvestmentfund', NULL, 'Banking', 'Sovereign Wealth', 'Riyadh', 'Saudi Arabia', ARRAY['Saudi Arabia','USA','UK'], 2100, '$925B AUM', 1971, 'pif.gov.sa', 'Anchor investor across NEOM, Diriyah, Red Sea Global and Roshn. Deep procurement pipeline.', 'PIF', ARRAY['Sovereign','Innovation','High Priority'], 88, 90, 82, 87, 94, 'Prospect', 'Qualified', 'N. Al Mansouri', 6),
('Foster + Partners', 'fosterpartners', NULL, 'Architecture', 'Architecture Firm', 'London', 'UK', ARRAY['UK','UAE','USA','China'], 1800, '$310M', 1967, 'fosterandpartners.com', 'Global architecture firm behind Apple Park, Bloomberg HQ, and multiple airport terminals.', 'F+', ARRAY['Architecture','Partner'], 68, 84, 82, 80, 74, 'Partner', 'Won', 'L. Fischer', 13),
('HSBC', 'hsbc', NULL, 'Banking', 'Retail & Corporate', 'London', 'UK', ARRAY['UK','UAE','Hong Kong','USA'], 220000, '$66.1B', 1865, 'hsbc.com', 'Global bank with active innovation lab and branded flagship programme.', 'HS', ARRAY['Banking','Innovation'], 62, 74, 60, 82, 68, 'Prospect', 'Prospect', 'L. Fischer', 3900),
('BMW Group', 'bmwgroup', NULL, 'Automotive', 'Luxury Automotive', 'Munich', 'Germany', ARRAY['Germany','USA','UAE','China'], 154000, '$168B', 1916, 'bmwgroup.com', 'Parent to BMW, MINI and Rolls-Royce. Investing heavily in immersive brand experiences.', 'BM', ARRAY['Automotive','Luxury'], 74, 82, 88, 88, 80, 'Prospect', 'Meeting', 'L. Fischer', 1400),
('Louvre Abu Dhabi', 'louvreabudhabi', NULL, 'Government', 'Museum', 'Abu Dhabi', 'UAE', ARRAY['UAE'], 320, '$120M', 2017, 'louvreabudhabi.ae', 'Landmark museum on Saadiyat Island under DCT Abu Dhabi.', 'LA', ARRAY['Culture','Government'], 60, 78, 90, 72, 70, 'Prospect', 'Qualified', 'R. Kaur', 1),
('Zaha Hadid Architects', 'zahahadidarchitects', NULL, 'Architecture', 'Architecture Firm', 'London', 'UK', ARRAY['UK','China','UAE'], 500, '$90M', 1980, 'zaha-hadid.com', 'Parametric-forward architecture studio.', 'ZH', ARRAY['Architecture'], 58, 92, 84, 84, 66, 'Partner', 'Won', 'L. Fischer', 4);

-- Set parent for Louis Vuitton -> LVMH
UPDATE public.organizations
SET parent_id = (SELECT id FROM public.organizations WHERE normalized_name = 'lvmh')
WHERE normalized_name = 'louisvuitton';
