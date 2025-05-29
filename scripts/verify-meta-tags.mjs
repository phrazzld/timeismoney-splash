import https from 'https';
import http from 'http';

/**
 * Fetches the HTML content from a URL and extracts meta tags
 */
async function fetchAndVerifyMetaTags(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Extract meta tags
          const metaTags = [];
          const metaRegex = /<meta[^>]+>/gi;
          const matches = data.match(metaRegex) || [];

          matches.forEach((tag) => {
            const nameMatch = tag.match(/name="([^"]+)"/);
            const propertyMatch = tag.match(/property="([^"]+)"/);
            const contentMatch = tag.match(/content="([^"]+)"/);

            if ((nameMatch || propertyMatch) && contentMatch) {
              metaTags.push({
                type: nameMatch ? 'name' : 'property',
                key: nameMatch ? nameMatch[1] : propertyMatch[1],
                value: contentMatch[1],
              });
            }
          });

          // Extract JSON-LD scripts
          const jsonLdRegex =
            /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
          const jsonLdMatches = data.match(jsonLdRegex) || [];
          const jsonLdData = [];

          jsonLdMatches.forEach((script) => {
            const jsonMatch = script.match(/>([^<]+)</);
            if (jsonMatch) {
              try {
                const json = JSON.parse(jsonMatch[1]);
                jsonLdData.push(json);
              } catch (e) {
                console.error('Failed to parse JSON-LD:', e.message);
              }
            }
          });

          resolve({ metaTags, jsonLdData });
        });
      })
      .on('error', reject);
  });
}

// Main verification
async function verifyMetaTags() {
  console.log('🔍 Verifying meta tags on localhost:3000...\n');

  try {
    const { metaTags, jsonLdData } = await fetchAndVerifyMetaTags('http://localhost:3000');

    console.log('📌 Meta Tags Found:');
    console.log('==================');

    // Group by type
    const nameMetaTags = metaTags.filter((m) => m.type === 'name');
    const propertyMetaTags = metaTags.filter((m) => m.type === 'property');

    if (nameMetaTags.length > 0) {
      console.log('\nName Meta Tags:');
      nameMetaTags.forEach((tag) => {
        console.log(`  ${tag.key}: "${tag.value}"`);
      });
    }

    if (propertyMetaTags.length > 0) {
      console.log('\nProperty Meta Tags (Open Graph/Twitter):');
      propertyMetaTags.forEach((tag) => {
        console.log(`  ${tag.key}: "${tag.value}"`);
      });
    }

    if (jsonLdData.length > 0) {
      console.log('\n📊 JSON-LD Structured Data:');
      console.log('===========================');
      jsonLdData.forEach((data, index) => {
        console.log(`\nSchema ${index + 1}: ${data['@type']}`);
        console.log(JSON.stringify(data, null, 2));
      });
    }

    // Verification summary
    console.log('\n✅ Verification Summary:');
    console.log('========================');
    console.log(`Total meta tags found: ${metaTags.length}`);
    console.log(`JSON-LD schemas found: ${jsonLdData.length}`);

    // Check for required tags
    const requiredTags = ['description', 'og:title', 'og:description', 'twitter:card'];
    const foundTags = metaTags.map((t) => t.key);
    const missingTags = requiredTags.filter((tag) => !foundTags.includes(tag));

    if (missingTags.length > 0) {
      console.log(`\n⚠️  Missing required tags: ${missingTags.join(', ')}`);
    } else {
      console.log('\n✅ All required meta tags are present!');
    }
  } catch (error) {
    console.error('❌ Error fetching page:', error.message);
    console.log('\nMake sure the development server is running on http://localhost:3000');
  }
}

// Run verification
verifyMetaTags();
