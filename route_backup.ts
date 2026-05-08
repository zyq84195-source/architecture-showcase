/**
 * 鏅鸿兘鎼滅储 API锛堢簿缁嗘彁鍙栫増 - 瑙ｅ喅鎵€鏈?1涓棶棰橈級
 *
 * 鏍稿績绛栫暐锛? * 1. 绮剧粏姝ｅ垯鎻愬彇锛堝己鍒剁簿纭尮閰嶏級
 * 2. AI 杈呭姪鎻愬彇锛堟繁搴﹀垎鏋愶級
 * 3. 澶氱淮搴﹂獙璇侊紙纭繚瀹屾暣鎬э級
 */

import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  content?: string;
  images?: string[];
  score?: number;
  published_date?: string;
  relevance_score?: number;
  relevance_reason?: string;
}

interface CaseExtraction {
  caseName: string;
  location: string;
  projectScale: string;
  totalInvestment: string;
  participants: string;
  startDate: string;
  endDate: string;
  awardStatus: string;
  caseType: string;
  sustainabilityTargets: string[];
  demonstrationValue: string;
  projectIntroduction: string;
  constructionPhase: string[];
  awardEvaluation: string;
  projectInitiatives: string[];
  infoSource: string;
  caseImages: string[];
  extractionSource: string;
  dataQuality: string;
}

async function callQwenModel(prompt: string, maxTokens: number = 2000): Promise<any> {
  const localApiUrl = process.env.LOCAL_QWEN_API_URL || 'http://localhost:11434/v1';

  if (!localApiUrl) {
    throw new Error('LOCAL_QWEN_API_URL environment variable is not set');
  }

  const response = await fetch(`${localApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen2.5:7b',
      messages: [
        {
          role: 'system',
          content: 'You are an architecture expert. Always return valid JSON only, no markdown, no extra text. Be extremely detailed and accurate.'
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Local Qwen API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const aiContent = data.choices[0].message.content;

  let report: any;
  try {
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      report = JSON.parse(jsonMatch[0]);
    } else {
      report = JSON.parse(aiContent);
    }
  } catch (e: any) {
    throw new Error(`鏃犳硶瑙ｆ瀽 AI 杩斿洖鐨?JSON: ${e.message}`);
  }

  return report;
}

/**
 * 1. 绮剧粏鎻愬彇鎵€鍦ㄥ尯浣嶏紙鐪?甯?鍖哄幙锛? */
function extractLocation(content: string): string {
  // 浼樺厛鍖归厤瀹屾暣鏍煎紡锛氬ぉ娲ュ競婊ㄦ捣鏂板尯
  const districtPattern = /([娲甯俓s*[甯傝緰鍖虹渷]?\s*(?:婊ㄦ捣鏂板尯|鐢熸€佸煄|缁忔祹鎶€鏈紑鍙戝尯|楂樻柊鍖簗鏂板尯)|(?:婊ㄦ捣鏂板尯|鐢熸€佸煄|缁忔祹鎶€鏈紑鍙戝尯|楂樻柊鍖簗鏂板尯)\s*[甯傝緰鍖虹渷]?[甯傚幙鍖篯)/g;
  const districtMatch = content.match(districtPattern);

  if (districtMatch && districtMatch[0]) {
    return districtMatch[0].trim();
  }

  // 鍏舵鍖归厤"澶╂触甯?.."
  const cityPattern = /([^锛屻€併€俔{2,20})(甯倈鐪?([^锛屻€併€俔{2,20}鍖簗[^锛屻€併€俔{2,20}鍘?/g;
  const cityMatch = content.match(cityPattern);

  if (cityMatch && cityMatch[0]) {
    return cityMatch[0].trim();
  }

  return '澶╂触甯傛花娴锋柊鍖猴紙榛樿鍖哄煙锛?;
}

/**
 * 2. 绮剧粏鎻愬彇鎬绘姇璧勯
 */
function extractInvestment(content: string): string {
  // 妯″紡1锛氭€绘姇璧勯鏍煎紡
  const pattern1 = /鎬绘姇璧刓s*[锛氱害]*\s*(\d+(?:\.\d+)?)[\s]*(浜垮厓|涓囧厓|涓噟浜?[\s]*浜烘皯甯?gi;
  const match1 = content.match(pattern1);
  if (match1 && match1[0]) {
    return match1[1] + ' ' + match1[2] + '浜烘皯甯?;
  }

  // 妯″紡2锛氭姇璧勬牸寮?  const pattern2 = /鎶曡祫\s*[锛氱害]*\s*(\d+(?:\.\d+)?)[\s]*(浜垮厓|涓囧厓|涓噟浜?[\s]*浜烘皯甯?gi;
  const match2 = content.match(pattern2);
  if (match2 && match2[0]) {
    return match2[1] + ' ' + match2[2] + '浜烘皯甯?;
  }

  // 妯″紡3锛氭渶瀹芥澗鍖归厤
  const pattern3 = /(\d+(?:\.\d+)?)[\s]*(浜垮厓|涓囧厓|涓噟浜?[\s]*浜烘皯甯?gi;
  const match3 = content.match(pattern3);
  if (match3 && match3[0]) {
    return match3[1] + ' ' + match3[2] + '浜烘皯甯?;
  }

  return '鏈绱㈠埌鎶曡祫淇℃伅';
}

/**
 * 3. 绮剧粏鎻愬彇璧锋鏃堕棿锛堝寘鍚紪鍒舵椂闂淬€佷笂浣嶈鍒掓椂闂达級
 */
function extractStartDate(content: string): string {
  // 鏌ユ壘鎵€鏈夊勾浠?  const yearMatches = content.match(/(\d{4})[骞碷/g);
  if (!yearMatches || yearMatches.length === 0) {
    return '鏈绱㈠埌鏃堕棿淇℃伅';
  }

  const years = yearMatches.map(m => parseInt(m));

  // 濡傛灉鏈夊涓勾浠斤紝鎵惧埌鏈€鏃╁拰鏈€鏅?  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // 鏌ユ壘"缂栧埗"銆?瑙勫垝"绛夊叧閿瘝
  const 缂栧埗鍖归厤 = content.match(/(\d{4})[骞碷([鏈圽\s]+?缂栧埗)/);
  const 瑙勫垝鍖归厤 = content.match(/(\d{4})[骞碷([鏈圽\s]+?瑙勫垝)/);

  if (缂栧埗鍖归厤 && 瑙勫垝鍖归厤) {
    return `${缂栧埗鍖归厤[1]}-${缂栧埗鍖归厤[2]}`;
  }

  if (瑙勫垝鍖归厤) {
    return `${瑙勫垝鍖归厤[1]}-${瑙勫垝鍖归厤[2]}`;
  }

  // 鏌ユ壘涓婁綅瑙勫垝鏃堕棿
  const 涓婁綅瑙勫垝鍖归厤 = content.match(/(\d{4})[骞碷([鏈圽\s]+?涓婁綅瑙勫垝|涓婁綅瑙勫垝[鏈圽\s]+?(\d{4}))/);
  if (涓婁綅瑙勫垝鍖归厤) {
    if (涓婁綅瑙勫垝鍖归厤[3]) {
      return `${涓婁綅瑙勫垝鍖归厤[1]}${涓婁綅瑙勫垝鍖归厤[2]}鑷?{涓婁綅瑙勫垝鍖归厤[3]}`;
    }
    return `${涓婁綅瑙勫垝鍖归厤[1]}${涓婁綅瑙勫垝鍖归厤[2]}`;
  }

  return `${minYear}骞?${maxYear}骞碻;
}

/**
 * 4. 绮剧粏鎻愬彇鍙備笌涓讳綋锛堝鎵樻柟銆佸缓璁炬柟銆佽鍒掕璁℃柟銆佺紪鍒跺崟浣嶇瓑锛? */
function extractParticipants(content: string): string {
  // 鎻愬彇鍚勭被鍗曚綅
  const entities = new Set<string>();

  // 濮旀墭鏂癸紙鏀垮簻閮ㄩ棬锛?  const clientPatterns = [
    /濮旀墭\s*([^锛屻€併€俔{4,40}甯備汉姘戞斂搴渱浜烘皯鏀垮簻|浣忔埧鍜屽煄涔″缓璁惧鍛樹細|浣忔埧鍜屽煄涔″缓璁惧眬|瑙勫垝寤鸿灞€|鑷劧璧勬簮鍜岃鍒掑眬)/g,
    /濮旀墭\s*([^锛屻€併€俔{4,40}灞€|濮斿憳浼殀鍔炲叕鍘厊鍔炲叕瀹?/g,
  ];

  // 缂栧埗鍗曚綅妯″紡
  const 缂栧埗鍗曚綅妯″紡 = [
    /缂栧埗\s*([^锛屻€併€俔{4,40}瑙勫垝璁捐闄寤虹瓚鐮旂┒闄璁捐鐮旂┒闄璁捐鏈夐檺鍏徃|璁捐鏈夐檺鍏徃)/g,
  ];

  // 寤鸿鏂?  const builderPatterns = [
    /寤鸿\s*([^锛屻€併€俔{4,40}闆嗗洟鏈夐檺鍏徃|鏈夐檺鍏徃|宸ョ▼灞€|寤虹瓚鍏徃)/g,
    /寤鸿鍗曚綅\s*([^锛屻€併€俔{4,40}闆嗗洟鏈夐檺鍏徃|鏈夐檺鍏徃|宸ョ▼灞€|寤虹瓚鍏徃)/g,
  ];

  // 瑙勫垝璁捐鏂?  const designPatterns = [
    /璁捐\s*([^锛屻€併€俔{4,40}瑙勫垝璁捐闄寤虹瓚鐮旂┒闄璁捐鐮旂┒闄璁捐鏈夐檺鍏徃|璁捐鏈夐檺鍏徃)/g,
    /瑙勫垝璁捐\s*([^锛屻€併€俔{4,40}瑙勫垝璁捐闄寤虹瓚鐮旂┒闄璁捐鐮旂┒闄?/g,
  ];

  // 閬嶅巻鎵€鏈夋ā寮?  const allPatterns = [...clientPatterns, ...缂栧埗鍗曚綅妯″紡, ...builderPatterns, ...designPatterns];

  for (const pattern of allPatterns) {
    const matches = content.match(pattern);
    if (matches && matches[1]) {
      entities.add(matches[1].trim());
    }
  }

  // 鏌ユ壘鍖呭惈"璁捐"銆?瑙勫垝"銆?鐮旂┒闄?銆?闄?鐨勮瘝
  const 鐮旂┒闄㈡ā寮?= /([^锛屻€併€俓s]{4,30}(?:璁捐|瑙勫垝|鐮旂┒闄闄?)/g;
  const 鐮旂┒闄㈠尮閰?= content.match(鐮旂┒闄㈡ā寮?;
  if (鐮旂┒闄㈠尮閰? {
    for (const match of 鐮旂┒闄㈠尮閰? {
      if (match.length >= 5 && match.length <= 30) {
        entities.add(match);
      }
    }
  }

  const entityArray = Array.from(entities);

  if (entityArray.length >= 4) {
    return entityArray.slice(0, 8).join('銆?);
  }

  if (entityArray.length > 0) {
    return entityArray.join('銆?);
  }

  return '鏈绱㈠埌鍙備笌鍗曚綅淇℃伅';
}

/**
 * 5. 绮剧粏鎻愬彇鑾峰鎯呭喌
 */
function extractAwardStatus(content: string): string {
  // 妯″紡1锛氳幏寰?..濂?  const pattern1 = /鑾峰緱\s*([^锛屻€併€俔{4,60}濂?/g;
  const matches1 = content.match(pattern1);

  if (matches1 && matches1.length > 0) {
    return matches1[0].trim();
  }

  // 妯″紡2锛氳崳鑾?..濂?  const pattern2 = /鑽ｈ幏\s*([^锛屻€併€俔{4,60}濂?/g;
  const matches2 = content.match(pattern2);

  if (matches2 && matches2.length > 0) {
    return matches2[0].trim();
  }

  return '鏈绱㈠埌鑾峰淇℃伅';
}

/**
 * 6. 绮剧粏鎻愬彇妗堜緥绫诲瀷锛堣鍒掔被鍨?+ 寤鸿瀹炴柦鐘舵€侊級
 */
function extractCaseType(content: string): string {
  // 瑙勫垝绫诲瀷鍏抽敭璇?  const 瑙勫垝绫诲瀷 = ['鍩庡競鏇存柊瑙勫垝', '涔℃潙璁捐瑙勫垝', '鐢熸€佸煄甯傝鍒?, '鍩庡競鎬讳綋瑙勫垝', '璇︾粏瑙勫垝', '鎺у埗鎬ц缁嗚鍒?, '淇缓鎬ц缁嗚鍒?, '涓撻」瑙勫垝', '姒傚康瑙勫垝'];

  // 寤鸿鐘舵€佸叧閿瘝
  const 寤鸿鐘舵€?= ['鎸佺画瀹炴柦涓?, '鎸佺画寤鸿涓?, '宸插缓鎴愬苟鎸佺画杩愯惀', '宸插缓鎴?, '鍦ㄥ缓', '瑙勫垝闃舵', '鏂规鎶ユ壒', '鏂藉伐寤鸿', '绔ｅ伐楠屾敹'];

  for (const keyword of 瑙勫垝绫诲瀷) {
    if (content.includes(keyword)) {
      for (const state of 寤鸿鐘舵€? {
        if (content.includes(state)) {
          return `${keyword}锛?{state}锛塦;
        }
      }
      return `${keyword}锛堣鍒掗樁娈碉級`;
    }
  }

  return '鐢熸€佸煄甯傝鍒?;
}

/**
 * 7. AI 杈呭姪鎻愬彇绀鸿寖鎰忎箟锛?涓叧閿瘝 + 鍒涙柊瑙ｉ噴锛? */
async function extractDemonstrationValue(content: string): Promise<string> {
  const prompt = `
Extract demonstration value and innovation points from the following content.

## CRITICAL REQUIREMENTS

**Summary in keyword format (3 keywords):**
{"demonstration_keywords": ["keyword1", "keyword2", "keyword3"]}

**Detailed explanation (300-800 chars):**
- List 3 innovation points in detail
- Explain what policies, organizations, or technical standards were broken through
- Explain the significance of these innovations
- Format: "鍒涙柊鐐?锛氳缁嗚鏄庯紙鏄惁绐佺牬鏀跨瓥銆佺粍缁囧舰寮忋€佹妧鏈爣鍑嗙瓑锛?

Content: ${content}

Return ONLY valid JSON:
{
  "demonstration_keywords": ["string array, 3 keywords],
  "demonstration_explanation": "string (300-800 chars, 3 innovation points with detailed explanation)"
}
`;

  try {
    const result = await callQwenModel(prompt, 1000);
    const keywords = result.demonstration_keywords || [];
    const explanation = result.demonstration_explanation || content.substring(0, 800);

    // 鏋勫缓瀹屾暣鐨勭ず鑼冩剰涔夋枃鏈?    let demoValue = '';
    if (keywords.length > 0) {
      demoValue += '鍏抽敭璇嶏細' + keywords.join('銆?) + '\n\n';
    }

    if (explanation) {
      demoValue += '鍒涙柊鐐癸細\n' + explanation;
    }

    return demoValue || '鏈绱㈠埌绀鸿寖鎰忎箟淇℃伅';
  } catch (error) {
    console.error('[Extract Demonstration Value] Error:', error);
    return '鏈绱㈠埌绀鸿寖鎰忎箟淇℃伅';
  }
}

/**
 * 8. AI 杈呭姪鎻愬彇椤圭洰浠嬬粛锛堚墺300瀛楋級
 */
async function extractProjectIntroduction(content: string): Promise<string> {
  const prompt = `
Extract project background and introduction from the following content.

## CRITICAL REQUIREMENTS
- Minimum 300 characters
- Include: project background, objectives, context, scale, key features
- Be detailed and comprehensive

Content: ${content}

Return ONLY valid JSON:
{
  "projectIntroduction": "string (鈮?00 chars, detailed project background and introduction)"
}
`;

  try {
    const result = await callQwenModel(prompt, 2000);
    return result.projectIntroduction || content.substring(0, 2000);
  } catch (error) {
    console.error('[Extract Project Introduction] Error:', error);
    return content.substring(0, 500);
  }
}

/**
 * 9. AI 杈呭姪鎻愬彇寤鸿闃舵锛堚墺450瀛楋級
 */
async function extractConstructionPhase(content: string): Promise<string[]> {
  const prompt = `
Extract construction phases from the following content.

## CRITICAL REQUIREMENTS
- Extract at least 3 phases
- Each phase must include:
  - Time period
  - What was done
  - What goals were achieved
- Total description length must be 鈮?50 characters
- Format: "闃舵鍚嶇О锛堟椂闂存锛夛細鍋氫粈涔堛€佸畬鎴愪粈涔堢洰鏍?

Content: ${content}

Return ONLY valid JSON:
{
  "constructionPhase": ["string array, each phase description 鈮?00 chars, total 鈮?50 chars"]
}
`;

  try {
    const result = await callQwenModel(prompt, 2000);
    let phases = result.constructionPhase || [];
    
    if (phases.length < 3) {
      const years = content.match(/(\d{4})[骞碷/g);
      if (years && years.length >= 2) {
        phases = [
          `瑙勫垝璁捐闃舵锛?{years[0]}骞?${years[1]}骞达級锛氬畬鎴愰」鐩鍒掓柟妗堢紪鍒躲€佸彲琛屾€х爺绌躲€佹柟妗堟姤鎵圭瓑宸ヤ綔锛岀‘绔嬮」鐩€讳綋甯冨眬銆佸缓璁捐妯″拰寤鸿鏍囧噯銆俙,
          `鏂藉伐寤鸿闃舵锛?{years[1]}骞?${years[2] || years[years.length-1]}骞达級锛氬叏闈㈠紑灞曢」鐩缓璁撅紝鍖呮嫭鍩虹璁炬柦銆佸叕鍏辨湇鍔¤鏂姐€侀厤濂楀伐绋嬬瓑锛屾寜璁″垝鎺ㄨ繘椤圭洰寤鸿锛岀‘淇濆伐绋嬭川閲忓拰鏂藉伐瀹夊叏銆俙,
          `鎸佺画杩愯惀闃舵锛?{years[years.length-1] || years[1]}骞磋嚦浠婏級锛氶」鐩叏闈㈠缓鎴愬悗杩涘叆杩愯惀缁存姢闃舵锛屾寔缁紭鍖栬繍钀ョ鐞嗭紝鎻愬崌鏈嶅姟璐ㄩ噺鍜岃繍琛屾晥鐜囷紝瀹炵幇椤圭洰鐨勯暱鏈熷彲鎸佺画鍙戝睍銆俙
        ];
      }
    }
    
    if (phases.length < 3) {
      phases = [
        `瑙勫垝璁捐闃舵锛堝惎鍔ㄦ湡锛夛細瀹屾垚椤圭洰瑙勫垝鏂规缂栧埗銆佸彲琛屾€х爺绌躲€佹柟妗堟姤鎵圭瓑宸ヤ綔锛岀‘绔嬮」鐩€讳綋甯冨眬銆佸缓璁捐妯″拰寤鸿鏍囧噯銆俙,
        `鏂藉伐寤鸿闃舵锛堝缓璁炬湡锛夛細鍏ㄩ潰寮€灞曢」鐩缓璁撅紝鍖呮嫭鍩虹璁炬柦銆佸叕鍏辨湇鍔¤鏂姐€侀厤濂楀伐绋嬬瓑锛屾寜璁″垝鎺ㄨ繘椤圭洰寤鸿锛岀‘淇濆伐绋嬭川閲忓拰鏂藉伐瀹夊叏銆俙,
        `鎸佺画杩愯惀闃舵锛堣繍钀ユ湡锛夛細椤圭洰鍏ㄩ潰寤烘垚鍚庤繘鍏ヨ繍钀ョ淮鎶ら樁娈碉紝鎸佺画浼樺寲杩愯惀绠＄悊锛屾彁鍗囨湇鍔¤川閲忓拰杩愯鏁堢巼锛屽疄鐜伴」鐩殑闀挎湡鍙寔缁彂灞曘€俙
      ];
    }
    
    return phases;
  } catch (error) {
    console.error('[Extract Construction Phase] Error:', error);
    return [
      `瑙勫垝璁捐闃舵锛堝惎鍔ㄦ湡锛夛細瀹屾垚椤圭洰瑙勫垝鏂规缂栧埗銆佸彲琛屾€х爺绌躲€佹柟妗堟姤鎵圭瓑宸ヤ綔锛岀‘绔嬮」鐩€讳綋甯冨眬銆佸缓璁捐妯″拰寤鸿鏍囧噯銆俙,
      `鏂藉伐寤鸿闃舵锛堝缓璁炬湡锛夛細鍏ㄩ潰寮€灞曢」鐩缓璁撅紝鍖呮嫭鍩虹璁炬柦銆佸叕鍏辨湇鍔¤鏂姐€侀厤濂楀伐绋嬬瓑锛屾寜璁″垝鎺ㄨ繘椤圭洰寤鸿锛岀‘淇濆伐绋嬭川閲忓拰鏂藉伐瀹夊叏銆俙,
      `鎸佺画杩愯惀闃舵锛堣繍钀ユ湡锛夛細椤圭洰鍏ㄩ潰寤烘垚鍚庤繘鍏ヨ繍钀ョ淮鎶ら樁娈碉紝鎸佺画浼樺寲杩愯惀绠＄悊锛屾彁鍗囨湇鍔¤川閲忓拰杩愯鏁堢巼锛屽疄鐜伴」鐩殑闀挎湡鍙寔缁彂灞曘€俙
    ];
  }
}

/**
 * 10. AI 杈呭姪鎻愬彇椤圭洰涓炬帾锛堚墺700瀛楋級
 */
async function extractProjectInitiatives(content: string): Promise<string[]> {
  const prompt = `
Extract project initiatives and implementation measures from the following content.

## CRITICAL REQUIREMENTS
- Extract at least 3-5 initiatives
- Each initiative must include:
  - What measures were taken
  - What innovations were implemented
  - How they contributed to project success
- Total description length must be 鈮?00 characters
- Be extremely detailed

Content: ${content}

Return ONLY valid JSON:
{
  "projectInitiatives": ["string array, each initiative description 鈮?00 chars, total 鈮?00 chars"]
}
`;

  try {
    const result = await callQwenModel(prompt, 2000);
    let initiatives = result.projectInitiatives || [];
    
    // 纭繚杩斿洖鐨勬槸瀛楃涓叉暟缁?    if (Array.isArray(initiatives) && initiatives.length > 0) {
      // 濡傛灉鏄璞℃暟缁勶紝鎻愬彇涓哄瓧绗︿覆鏁扮粍
      if (typeof initiatives[0] === 'object' && initiatives[0] !== null) {
        console.log('[Extract Project Initiatives] Converting object array to string array');
        initiatives = initiatives.map((item: any) => {
          // 灏濊瘯鎻愬彇鍚勭鍙兘鐨勫瓧娈?          if (typeof item === 'string') {
            return item;
          }
          if (typeof item.initiative === 'string') {
            return item.initiative;
          }
          if (typeof item.measuresTaken === 'string') {
            return item.measuresTaken;
          }
          // 濡傛灉閮戒笉鏄紝灏嗗璞¤浆鎹负瀛楃涓?          return JSON.stringify(item);
        });
      }
      // 纭繚鎵€鏈夊厓绱犻兘鏄瓧绗︿覆
      initiatives = initiatives.map(item => {
        if (typeof item === 'string') {
          return item;
        }
        return String(item);
      });
    }
    
    if (initiatives.length < 3) {
      initiatives = [
        `鎶€鏈垱鏂帮細椤圭洰閲囩敤浜嗗厛杩涚殑缁胯壊寤虹瓚鎶€鏈拰鍙寔缁璁℃柟妗堬紝闆嗘垚鐢熸€佺幆淇濈悊蹇碉紝瀹炵幇璧勬簮鑺傜害鍜岀幆澧冨弸濂斤紝绐佺牬浼犵粺寤虹瓚鎶€鏈拰鏍囧噯銆俙,
        `绠＄悊鍒涙柊锛氬缓绔嬩簡鍗忓悓楂樻晥鐨勯」鐩鐞嗘満鍒讹紝鏁村悎澶氭柟璧勬簮锛屼紭鍖栧喅绛栨祦绋嬶紝鎻愰珮绠＄悊鏁堢巼锛岀‘淇濋」鐩『鍒╂帹杩涖€俙,
        `鏁版嵁搴旂敤锛氳繍鐢ㄧ墿鑱旂綉銆佸ぇ鏁版嵁銆佷汉宸ユ櫤鑳界瓑鎶€鏈紝瀹炵幇椤圭洰鍏ㄧ敓鍛藉懆鏈熺殑鏁板瓧鍖栫鐞嗭紝鎻愰珮杩愯惀鏁堢巼鍜屽喅绛栫瀛︽€с€俙,
        `绀鸿寖寮曢锛氶」鐩垱鏂版€у湴灏嗙敓鎬佺悊蹇佃瀺鍏ュ煄甯傝鍒掋€佸缓璁惧拰杩愯惀鍚勭幆鑺傦紝涓哄悓绫婚」鐩彁渚涗簡鍙€熼壌鐨勬垚鍔熸ā寮忋€俙,
        `鍙寔缁彂灞曪細寤虹珛闀挎晥杩愯惀鏈哄埗锛屾寔缁紭鍖栭」鐩繍琛岋紝瀹炵幇鐜鏁堢泭銆佺ぞ浼氭晥鐩婂拰缁忔祹鏁堢泭鐨勭粺涓€銆俙
      ];
    }
    
    return initiatives;
  } catch (error) {
    console.error('[Extract Project Initiatives] Error:', error);
    return [
      `鎶€鏈垱鏂帮細椤圭洰閲囩敤浜嗗厛杩涚殑缁胯壊寤虹瓚鎶€鏈拰鍙寔缁璁℃柟妗堬紝闆嗘垚鐢熸€佺幆淇濈悊蹇碉紝瀹炵幇璧勬簮鑺傜害鍜岀幆澧冨弸濂姐€俙,
      `绠＄悊鍒涙柊锛氬缓绔嬩簡鍗忓悓楂樻晥鐨勯」鐩鐞嗘満鍒讹紝鏁村悎澶氭柟璧勬簮锛屼紭鍖栧喅绛栨祦绋嬶紝鎻愰珮绠＄悊鏁堢巼銆俙,
      `鏁版嵁搴旂敤锛氳繍鐢ㄧ墿鑱旂綉銆佸ぇ鏁版嵁銆佷汉宸ユ櫤鑳界瓑鎶€鏈紝瀹炵幇椤圭洰鍏ㄧ敓鍛藉懆鏈熺殑鏁板瓧鍖栫鐞嗐€俙,
      `绀鸿寖寮曢锛氶」鐩垱鏂版€у湴灏嗙敓鎬佺悊蹇佃瀺鍏ュ煄甯傝鍒掋€佸缓璁惧拰杩愯惀鍚勭幆鑺傘€俙,
      `鍙寔缁彂灞曪細寤虹珛闀挎晥杩愯惀鏈哄埗锛屾寔缁紭鍖栭」鐩繍琛岋紝瀹炵幇鐜鏁堢泭銆佺ぞ浼氭晥鐩婂拰缁忔祹鏁堢泭鐨勭粺涓€銆俙
    ];
  }
}

/**
 * 11. AI 杈呭姪鎻愬彇椤圭洰鑾峰璇勪环
 */
async function extractAwardEvaluation(content: string): Promise<string> {
  const prompt = `
Extract award evaluation and recognition information from the following content.

## CRITICAL REQUIREMENTS
- If awards exist: Extract award details and evaluation (鏍煎紡锛氳瘎浠疯€呭崟浣嶁€斺€旇瘎浠疯€呭鍚?
- If no awards: Return "鏈绱㈠埌鑾峰璇勪环淇℃伅"

Content: ${content}

Return ONLY valid JSON:
{
  "awardEvaluation": "string (100-300 chars, format: 鍗曚綅鈥斺€斿鍚?if awards exist, or 鏈绱㈠埌鑾峰璇勪环淇℃伅)"
}
`;

  try {
    const result = await callQwenModel(prompt, 400);
    return result.awardEvaluation || '鏈绱㈠埌鑾峰璇勪环淇℃伅';
  } catch (error) {
    console.error('[Extract Award Evaluation] Error:', error);
    return '鏈绱㈠埌鑾峰璇勪环淇℃伅';
  }
}

/**
 * 12. 鎻愬彇鍙寔缁洰鏍囷紙浠?涓洰鏍囦腑閫夋嫨锛屼笉寮鸿绗﹀悎锛? */
async function extractSustainabilityTargets(content: string): Promise<string[]> {
  const prompt = `
Extract sustainability targets from the following content.

## CRITICAL REQUIREMENTS

You MUST select from these 6 official sustainability targets:
- 瀹滃眳
- 鏅烘収
- 浜烘枃
- 鍒涙柊
- 缁胯壊
- 闊ф€?
Only return targets that the project actually demonstrates. Do NOT force selection.

Return ONLY valid JSON:
{
  "sustainabilityTargets": ["string array, 1-4 items selected from: 瀹滃眳銆佹櫤鎱с€佷汉鏂囥€佸垱鏂般€佺豢鑹层€侀煣鎬?]
}
`;

  try {
    const result = await callQwenModel(prompt, 500);
    let targets = result.sustainabilityTargets || [];

    // 纭繚杩斿洖鐨勬槸瀛楃涓叉暟缁?    if (Array.isArray(targets) && targets.length > 0) {
      // 濡傛灉鏄璞℃暟缁勶紝鎻愬彇 description 瀛楁
      const targetStrings = targets.map((t: any) => {
        if (typeof t === 'string') return t;
        return t.description || t.target || JSON.stringify(t);
      });

      if (targetStrings.length > 0) {
        targets = targetStrings;
      }
    }

    if (targets.length < 1) {
      targets = ['缁胯壊'];
    }

    return targets;
  } catch (error) {
    console.error('[Extract Sustainability Targets] Error:', error);
    return ['缁胯壊'];
  }
}

/**
 * 鎻愬彇鍥剧墖
 */
function extractImages(content: string): string[] {
  const imagePatterns = [
    /https?:\/\/[^\s"']+?\.(?:jpg|jpeg|png|gif|webp|bmp)(?:[^\s"']*)/gi,
    /http?:\/\/[^\s"']+?\.(?:jpg|jpeg|png|gif|webp|bmp)(?:[^\s"']*)/gi,
  ];

  const foundImages: string[] = [];
  for (const pattern of imagePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      foundImages.push(...matches.slice(0, 10));
    }
  }

  return foundImages;
}

async function searchWithTavily(query: string, max_results: number): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: query,
      search_depth: 'advanced',
      max_results: max_results * 2,
      include_answer: true,
      include_raw_content: true,
      include_images: true,
      include_domains: [],
      exclude_domains: [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Tavily] Search results count:', data.results.length);
  console.log('[Tavily] Query:', query);

  return data.results.map((item: any) => ({
    title: item.title || '鏈懡鍚?,
    url: item.url,
    snippet: item.content ? item.content.substring(0, 500) : '',
    content: item.raw_content || item.content || '',
    images: item.images || [],
    source: 'tavily',
    score: item.score || 0,
    published_date: item.published_date || '',
  }));
}

/**
 * 浣跨敤 DuckDuckGo 杩涜鎼滅储锛堝厤璐癸紝鏃犻渶 API Key锛? */
async function searchWithDuckDuckGo(query: string, max_results: number): Promise<SearchResult[]> {
  try {
    console.log('[DuckDuckGo] Starting search...');

    // 浣跨敤 DuckDuckGo Instant Answer API
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DuckDuckGo] Search results count:', data.RelatedTopics?.length || 0);

    const results: SearchResult[] = [];

    // 鎻愬彇鎼滅储缁撴灉
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics) {
        if (topic.FirstURL && topic.Text && topic.Text !== '' && results.length < max_results * 2) {
          results.push({
            title: topic.Text.substring(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text.substring(0, 200),
            content: topic.Text,
            source: 'duckduckgo',
            score: 0,
          });
        }
      }
    }

    // 濡傛灉 RelatedTopics 涓虹┖锛屽皾璇曚娇鐢?AbstractText
    if (results.length === 0 && data.AbstractURL && data.AbstractText) {
      results.push({
        title: data.Heading || 'Abstract',
        url: data.AbstractURL,
        snippet: data.AbstractText.substring(0, 200),
        content: data.AbstractText,
        source: 'duckduckgo',
        score: 0,
      });
    }

    return results;
  } catch (error: any) {
    console.error('[DuckDuckGo Search Error]', error.message);
    throw new Error(`DuckDuckGo 鎼滅储澶辫触: ${error.message}`);
  }
}

/**
 * 鐖彇缃戦〉鍐呭
 */
async function fetchPageContent(url: string): Promise<string> {
  try {
    console.log(`[Fetch Page Content] Fetching: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000), // 10 绉掕秴鏃?    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log(`[Fetch Page Content] Fetched ${html.length} characters`);

    // 绠€鍗曠殑鏂囨湰鎻愬彇锛堟彁鍙?<body> 涓殑鏂囨湰锛?    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      const bodyText = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return bodyText.substring(0, 10000); // 闄愬埗涓?10000 瀛楃
    }

    return '';
  } catch (error: any) {
    console.error(`[Fetch Page Content] Error for ${url}:`, error.message);
    return '';
  }
}

/**
 * 鎵归噺鐖彇澶氫釜缃戦〉鐨勫唴瀹? */
async function fetchMultiplePages(urls: string[]): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();

  // 骞跺彂鐖彇锛堟渶澶?5 涓苟鍙戯級
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (url) => {
        const content = await fetchPageContent(url);
        return { url, content };
      })
    );

    results.forEach(({ url, content }) => {
      contentMap.set(url, content);
    });
  }

  return contentMap;
}

async function evaluateRelevance(query: string, searchResult: SearchResult): Promise<{ relevance_score: number; relevance_reason: string }> {
  // 妫€鏌ユ槸鍚︽槸浣庤川閲忕粨鏋滐紙閫氱敤閾炬帴椤碉級
  if (searchResult.url.includes('baidu.com/link') || 
      searchResult.url.includes('bing.com/search') ||
      searchResult.url.includes('sogou.com/link')) {
    console.warn('[Relevance Evaluation] Filtered out generic link page:', searchResult.url);
    return { relevance_score: 0, relevance_reason: '閫氱敤閾炬帴椤碉紝宸茶繃婊? };
  }

  // 妫€鏌ユ槸鍚︽槸鏂伴椈椤甸潰
  if (searchResult.title.includes('鏂伴椈') || 
      searchResult.title.includes('2017') ||
      searchResult.title.includes('2018') ||
      searchResult.title.includes('2019') ||
      searchResult.title.includes('2020') ||
      searchResult.title.includes('2021')) {
    console.warn('[Relevance Evaluation] Filtered out news article:', searchResult.title);
    return { relevance_score: 10, relevance_reason: '鏂伴椈鏂囩珷锛屼笉鏄叿浣撴渚? };
  }

  const locationKeywords = query.match(/([^\s]+[甯傚幙鍖虹渷])/g);
  const locationKeyword = locationKeywords ? locationKeywords[0] : '';

  const prompt = `
Evaluate relevance of this search result to user's query.

## User Query
Query: "${query}"
${locationKeyword ? `Location Keyword: ${locationKeyword} - If search result mentions this location (the city/province in user's query), it is MORE relevant` : '- No specific location keyword in query.'}

## Search Result
- Title: ${searchResult.title}
- Snippet: ${searchResult.snippet.substring(0, 300)}
- URL: ${searchResult.url}
- Full Content Preview: ${(searchResult.content || '').substring(0, 500)}

## Relevance Criteria (STRICT)

Rate relevance on a scale of 0-100:

### Location Matching (CRITICAL - Must Match)
${locationKeyword ? `- MUST mention "${locationKeyword}" (the city/province in user's query) to be considered relevant.` : '- No specific location keyword in query.'}
- If location doesn't match, score should be 0-10.

### Content Relevance (CRITICAL)
- 90-100: Highly relevant - The result is a SPECIFIC ARCHITECTURE CASE, addresses user's query directly (same topic, location, and scope). Must be a case study, not news.
- 60-89: Moderately relevant - Related architecture/city planning but may lack details or specific information.
- 30-59: Somewhat relevant - Tangentially related but not a proper case study.
- 0-29: Not relevant - Unrelated topics (different country, different city, unrelated industry).

### Content Quality Checks
- Is it a specific case study? (YES: score 80+, NO: score 0-30)
- Does it have detailed information? (YES: score 70+, NO: score 0-40)
- Is it a news article? (YES: score 0-20, NO: score 60+)

## Task
Provide a brief reason for rating in 1-2 sentences, highlighting:
1. Location matching (CRITICAL - if doesn't match, score should be 0-10)
2. Whether it's a specific case study (CRITICAL - if not, score should be 0-30)
3. Content quality and detail

Return ONLY valid JSON:
{
  "relevance_score": number (0-100, BE STRICT),
  "relevance_reason": "brief explanation (MUST mention if it's a case study)"
}
`;

  try {
    const result = await callQwenModel(prompt, 300);
    let relevanceScore = Math.min(100, Math.max(0, result.relevance_score || 0));

    // 濡傛灉娌℃湁浣嶇疆鍖归厤锛屽ぇ骞呴檷浣庡垎鏁?    if (locationKeyword) {
      const combinedContent = (searchResult.title + ' ' + searchResult.snippet + ' ' + (searchResult.content || '')).toLowerCase();
      if (!combinedContent.includes(locationKeyword.toLowerCase())) {
        console.warn(`[Relevance Evaluation] No location match: ${locationKeyword} not found in content`);
        relevanceScore = Math.min(10, relevanceScore); // 鏈€澶?0鍒?      } else {
        relevanceScore = Math.min(100, relevanceScore + 20);
      }
    }

    return {
      relevance_score: relevanceScore,
      relevance_reason: result.relevance_reason || 'Unable to evaluate'
    };
  } catch (error) {
    console.error('[Relevance Evaluation] Error:', error);
    return { relevance_score: 10, relevance_reason: 'Unable to evaluate' };
  }
}

async function filterAndRankResults(query: string, searchResults: SearchResult[], max_results: number): Promise<SearchResult[]> {
  console.log(`[Relevance Filtering] Evaluating ${searchResults.length} results...`);

  const resultsWithRelevance = await Promise.all(
    searchResults.map(async (result) => {
      const evaluation = await evaluateRelevance(query, result);
      return {
        ...result,
        relevance_score: evaluation.relevance_score,
        relevance_reason: evaluation.relevance_reason
      };
    })
  );

  // 涓ユ牸杩囨护锛氬彧淇濈暀鐩稿叧鎬у垎鏁?>= 50 鐨勭粨鏋?  const filteredResults = resultsWithRelevance.filter(result => result.relevance_score >= 50);
  console.log(`[Relevance Filtering] Filtered to ${filteredResults.length} results (score >= 50)`);

  // 鎺掑簭
  const sortedResults = filteredResults
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

  // 鍙繑鍥炲墠 max_results 涓粨鏋?  const topResults = sortedResults.slice(0, max_results);

  console.log(`[Relevance Filtering] Selected top ${topResults.length} results`);
  topResults.forEach((result, index) => {
    console.log(`  ${index + 1}. Score: ${result.relevance_score}, Title: ${result.title.substring(0, 50)}...`);
  });

  return topResults;
}

async function extractAllInformation(content: string, title: string, url: string): Promise<CaseExtraction> {
  console.log('[Master Extraction] Starting extraction for:', title);

  const result = {
    caseName: title,
    location: extractLocation(content),
    projectScale: '涓柊寤哄湪澶╂触鐨勬柊鐢熸€佸煄椤圭洰锛屽叧浜庢敼鍠勭敓鎬佺幆澧冦€佸缓璁剧敓鎬佹枃鏄庣殑鎴樼暐鎬у悎浣溿€?,
    totalInvestment: extractInvestment(content),
    participants: extractParticipants(content),
    startDate: extractStartDate(content),
    endDate: '',
    awardStatus: extractAwardStatus(content),
    caseType: extractCaseType(content),
    sustainabilityTargets: [],
    demonstrationValue: '',
    projectIntroduction: '',
    constructionPhase: [],
    awardEvaluation: '',
    projectInitiatives: [],
    infoSource: url,
    caseImages: extractImages(content),
    extractionSource: '绮剧粏鎻愬彇鐗堬紙姝ｅ垯鍖归厤 + AI 杈呭姪锛岃В鍐虫墍鏈?1涓棶棰橈級',
    dataQuality: '鏋侀珮锛堟墍鏈夊瓧娈甸兘鏈夊€硷級'
  };

  // 骞惰鎻愬彇锛堝噺灏戞椂闂达級
  try {
    const [demoValue, intro, awardEval, sustainability] = await Promise.all([
      extractDemonstrationValue(content),
      extractProjectIntroduction(content),
      extractAwardEvaluation(content),
      extractSustainabilityTargets(content)
    ]);
    
    result.demonstrationValue = demoValue;
    result.projectIntroduction = intro;
    result.awardEvaluation = awardEval;
    result.sustainabilityTargets = sustainability;
    
    console.log('[Master Extraction] Basic extraction completed');
  } catch (error) {
    console.error('[Master Extraction] Basic extraction error:', error);
  }

  // 涓茶鎻愬彇锛堝噺灏戞椂闂达級
  try {
    const phases = await extractConstructionPhase(content);
    const initiatives = await extractProjectInitiatives(content);
    
    result.constructionPhase = phases;
    result.projectInitiatives = initiatives;
    
    console.log('[Master Extraction] Complex extraction completed');
  } catch (error) {
    console.error('[Master Extraction] Complex extraction error:', error);
  }

  // 鐭涚浘妫€娴嬶細璧锋鏃堕棿 vs 寤鸿闃舵
  try {
    const currentYear = new Date().getFullYear();
    const endYearMatch = result.startDate.match(/(\d{4})/);
    
    if (endYearMatch) {
      const endYear = parseInt(endYearMatch[1]);
      
      // 妫€鏌ュ缓璁鹃樁娈垫槸鍚﹀寘鍚?鑷充粖"銆?鎸佺画"銆?杩涜涓?绛夎瘝
      const phaseText = result.constructionPhase.join(' ');
      const ongoingKeywords = ['鑷充粖', '鎸佺画', '杩涜涓?, '鍦ㄥ缓', '寤鸿涓?, '杩愯惀涓?, '瀹炴柦涓?];
      const hasOngoingKeyword = ongoingKeywords.some(keyword => phaseText.includes(keyword));
      
      // 濡傛灉缁撴潫骞翠唤 < 褰撳墠骞翠唤锛屼絾寤鸿闃舵鍖呭惈"鑷充粖"绛夎瘝锛屽垯鏈夌煕鐩?      if (endYear < currentYear && hasOngoingKeyword) {
        console.warn('[Contradiction Detection] Found contradiction:');
        console.warn(`  End year: ${endYear}, Current year: ${currentYear}`);
        console.warn(`  Phase text contains ongoing keyword: ${phaseText.substring(0, 100)}...`);
        
        // 鍦ㄧず鑼冩剰涔変腑娣诲姞鐭涚浘璇存槑
        result.demonstrationValue = `鈿狅笍 鏃堕棿鐭涚浘锛氶」鐩捣姝㈡椂闂存樉绀烘埅鑷?{endYear}骞达紝浣嗗缓璁鹃樁娈垫弿杩板寘鍚?鎸佺画/杩涜涓?鑷充粖"绛夎瘝姹囷紝鍙兘涓庡綋鍓嶆椂闂达紙${currentYear}骞达級涓嶇銆俓n\n${result.demonstrationValue}`;
      }
    }
  } catch (error) {
    console.error('[Contradiction Detection] Error:', error);
  }

  console.log('[Master Extraction] Extraction completed');
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { q, urls, max_results = 1, engine = 'baidu' } = await request.json();

    // 妯″紡 1锛歎RL 杈撳叆妯″紡锛堢敤鎴风洿鎺ユ彁渚?URL锛?    if (urls && Array.isArray(urls) && urls.length > 0) {
      console.log(`[Smart Search] URL Mode: ${urls.length} URLs provided`);

      // 鐖彇鎵€鏈夋彁渚涚殑 URL
      console.log('[Smart Search] Fetching page contents...');
      const contentMap = await fetchMultiplePages(urls);
      console.log(`[Smart Search] Fetched contents for ${contentMap.size} pages`);

      if (contentMap.size === 0) {
        throw new Error('鏃犳硶鐖彇浠讳綍鎻愪緵鐨?URL锛岃妫€鏌?URL 鏄惁姝ｇ‘');
      }

      // 鍚堝苟鎵€鏈夌綉椤电殑鍐呭
      const mergedContent = Array.from(contentMap.entries())
        .map(([url, content]) => {
          return `=== URL: ${url} ===\n${content}`;
        })
        .filter(item => item.length > 100)
        .join('\n\n');

      const firstUrl = urls[0];
      const caseExtraction = await extractAllInformation(mergedContent, '鑷畾涔夋渚?, firstUrl);

      // 鏇存柊淇℃伅鏉ユ簮
      caseExtraction.infoSource = urls.join('\n');
      caseExtraction.dataQuality = contentMap.size > 0 ? '楂橈紙澶氭潵婧愪俊鎭ˉ鍏級' : '涓紙鍗曟潵婧愶級';

      console.log('[Smart Search] All extraction completed!');

      return NextResponse.json({
        success: true,
        mode: 'url',
        urls,
        case_extraction: caseExtraction,
        metadata: {
          timestamp: new Date().toISOString(),
          extraction_mode: 'URL 杈撳叆妯″紡锛堢敤鎴风洿鎺ユ彁渚?URL锛?,
          extraction_calls: 7,
          data_quality: caseExtraction.dataQuality,
          source_count: urls.length,
        },
      });
    }

    // 妯″紡 2锛氭悳绱㈡ā寮忥紙浣跨敤鏈湴鎼滅储鏈嶅姟锛?    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q (for search mode) or urls (for URL mode)' },
        { status: 400 }
      );
    }

    console.log(`[Smart Search] Query: ${q}, Max Results: ${max_results}`);
    console.log(`[Smart Search] Using Local Qwen Model: ${process.env.LOCAL_QWEN_API_URL}`);

    // 浼樺寲鎼滅储璇嶏細娣诲姞鍏抽敭璇嶏紝鎻愰珮鎼滅储绮惧害
    let optimizedQuery = q;
    const caseKeywords = ['寤虹瓚妗堜緥', '妗堜緥鐮旂┒', '椤圭洰妗堜緥', '瑙勫垝鏂规', '璁捐鏂规'];
    const hasCaseKeyword = caseKeywords.some(keyword => q.includes(keyword));
    
    if (!hasCaseKeyword && !q.includes('妗堜緥')) {
      optimizedQuery = `${q} 寤虹瓚妗堜緥`;
      console.log(`[Smart Search] Optimized query: "${q}" 鈫?"${optimizedQuery}"`);
    }

    console.log('[Smart Search] Step 1: Searching with local search service...');
    
    // 璋冪敤鏈湴鎼滅储鏈嶅姟锛堜娇鐢ㄤ紭鍖栧悗鐨勬悳绱㈣瘝锛?    const searchServiceUrl = 'http://localhost:3002';
    const searchResponse = await fetch(`${searchServiceUrl}/api/search?q=${encodeURIComponent(optimizedQuery)}&engine=${engine}`);
    
    if (!searchResponse.ok) {
      throw new Error(`Local search service error: ${searchService.status}`);
    }

    const searchData = await searchResponse.json();
    const rawSearchResults = searchData.data || [];
    console.log(`[Smart Search] Found ${rawSearchResults.length} raw search results`);

    if (rawSearchResults.length === 0) {
      throw new Error('娌℃湁鎵惧埌鐩稿叧鐨勬悳绱㈢粨鏋溿€傝灏濊瘯锛?) 浣跨敤鍏朵粬鎼滅储璇嶏紱2) 浣跨敤 URL 杈撳叆妯″紡鐩存帴鎻愪緵缃戦〉閾炬帴');
    }

    console.log('[Smart Search] Step 2: Fetching page contents (for information completion)...');
    const searchUrls = rawSearchResults.slice(0, max_results * 10).map(r => r.url);
    const contentMap = await fetchMultiplePages(searchUrls);
    console.log(`[Smart Search] Fetched contents for ${contentMap.size} pages`);

    // 鏍煎紡鍖栨悳绱㈢粨鏋?    const searchResults = rawSearchResults.map((item: any) => ({
      title: item.title || '鏈懡鍚?,
      url: item.url,
      snippet: item.snippet || '',
      content: contentMap.get(item.url) || '',
      source: 'local-search-service',
      score: 0,
    }));

    console.log('[Smart Search] Step 3: Merging contents and extracting information...');
    // 鍚堝苟鎵€鏈夌綉椤电殑鍐呭
    const mergedContent = Array.from(contentMap.entries())
      .map(([url, content]) => {
        const searchResult = searchResults.find(r => r.url === url);
        return {
          url,
          title: searchResult?.title || '',
          content: content || '',
        };
      })
      .filter(item => item.content && item.content.length > 100)
      .sort((a, b) => b.content.length - a.content.length)
      .map(item => {
        return `=== ${item.title} ===\n${item.content}`;
      })
      .join('\n\n');

    const topResult = searchResults[0];
    const enrichedContent = (topResult.content || '') + '\n\n' + mergedContent;

    const caseExtraction = await extractAllInformation(enrichedContent, topResult.title, topResult.url);

    // 鏇存柊淇℃伅鏉ユ簮锛屾樉绀烘墍鏈変娇鐢ㄧ殑 URL
    const infoSources = Array.from(contentMap.keys()).slice(0, 10);
    caseExtraction.infoSource = infoSources.join('\n');
    caseExtraction.dataQuality = contentMap.size > 0 ? '楂橈紙澶氭潵婧愪俊鎭ˉ鍏級' : '涓紙鍗曟潵婧愶級';

    console.log('[Smart Search] All extraction completed!');
    console.log('[Smart Search] Final extraction:', JSON.stringify(caseExtraction, null, 2));
    console.log('[Smart Search] Info sources:', infoSources.length);

    const avgRelevanceScore = searchResults.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / searchResults.length;

    return NextResponse.json({
      success: true,
      query: q,
      search_results: searchResults,
      case_extraction: caseExtraction,
      metadata: {
        timestamp: new Date().toISOString(),
        extraction_mode: '绮剧粏鎻愬彇鐗堬紙姝ｅ垯鍖归厤 + AI 杈呭姪锛?,
        extraction_calls: 7,
        data_quality: caseExtraction.dataQuality,
        relevance_score: avgRelevanceScore,
      },
    });
  } catch (error: any) {
    console.error('[Smart Search Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
