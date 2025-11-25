/**
 * CSV Export Utility
 * Generates CSV files from signup data with UTM attribution
 */

export function generateSignupsCSV(signups: any[]): string {
  // CSV headers
  const headers = [
    'ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Facility Name',
    'Facility Type',
    'Resident Count',
    'Tier',
    'Interested Features',
    'Additional Needs',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Term',
    'UTM Content',
    'Created At',
    'Last Email Sent',
    'Emails Sent Count',
  ];

  // Convert data to CSV rows
  const rows = signups.map((signup) => {
    const interestedFeatures = signup.interestedFeatures
      ? (typeof signup.interestedFeatures === 'string'
          ? JSON.parse(signup.interestedFeatures)
          : signup.interestedFeatures
        ).join('; ')
      : '';

    return [
      signup.id,
      escapeCSV(signup.firstName),
      escapeCSV(signup.lastName),
      escapeCSV(signup.email),
      escapeCSV(signup.phone || ''),
      escapeCSV(signup.facilityName),
      escapeCSV(signup.facilityType),
      signup.residentCount,
      escapeCSV(signup.tier),
      escapeCSV(interestedFeatures),
      escapeCSV(signup.additionalNeeds || ''),
      escapeCSV(signup.utmSource || ''),
      escapeCSV(signup.utmMedium || ''),
      escapeCSV(signup.utmCampaign || ''),
      escapeCSV(signup.utmTerm || ''),
      escapeCSV(signup.utmContent || ''),
      new Date(signup.createdAt).toISOString(),
      signup.lastEmailSent ? new Date(signup.lastEmailSent).toISOString() : '',
      signup.emailsSentCount || 0,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  
  // Convert to string if not already
  const str = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Generate filename with timestamp
 */
export function generateCSVFilename(prefix: string = 'signups'): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}_${timestamp}.csv`;
}
