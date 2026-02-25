import { EcosystemFooter } from "@fintutto/shared";

export function EcosystemFooterWrapper() {
  return (
    <EcosystemFooter
      currentAppSlug="vermietify"
      appName="Vermietify"
      appIcon="🏠"
      appDescription="Die moderne Immobilienverwaltung. Mieter, Verträge, Finanzen — alles in einer App."
      columns={[
        {
          title: 'Verwaltung',
          links: [
            { name: 'Immobilien', href: '/properties' },
            { name: 'Mieter', href: '/tenants' },
            { name: 'Verträge', href: '/vertraege' },
            { name: 'Betriebskosten', href: '/betriebskosten' },
          ],
        },
        {
          title: 'Finanzen',
          links: [
            { name: 'Zahlungen', href: '/zahlungen' },
            { name: 'Banking', href: '/banking' },
            { name: 'Steuern', href: '/taxes' },
          ],
        },
      ]}
    />
  );
}
