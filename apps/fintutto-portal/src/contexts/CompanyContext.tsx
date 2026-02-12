import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
  tax_id?: string;
  address?: string;
  legal_form?: string;
  vat_id?: string;
  zip?: string;
  city?: string;
  chart_of_accounts?: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  loading: boolean;
  refetchCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const { data: memberships } = await supabase
        .from('company_members')
        .select('company_id');

      if (memberships && memberships.length > 0) {
        const companyIds = memberships.map(m => m.company_id);
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, name, tax_id, address, legal_form, vat_id, zip, city, chart_of_accounts')
          .in('id', companyIds);

        if (companiesData) {
          setCompanies(companiesData);
          if (!currentCompany && companiesData.length > 0) {
            setCurrentCompany(companiesData[0]);
          }
        }
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        setCurrentCompany,
        loading,
        refetchCompanies: fetchCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
