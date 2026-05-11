delete from intelligence_items
where source_url like 'https://example.com/%'
   or author in ('MedLegal Market Watch', 'Summit Marketing', 'Regional Case Management Review', 'Claims Strategy Journal', 'Legal Tech Monitor');

delete from competitors
where website like 'https://example.com/%'
   or company_name in ('Aegis Life Planning Group', 'Summit MedLegal Analytics', 'Harbor Rehabilitation Experts');
