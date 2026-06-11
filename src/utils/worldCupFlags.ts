export interface TeamFlagInfo {
  code: string;
  displayName: string;
  asset: string;
  aliases: string[];
}

const flagPath = (code: string) => `/assets/flags/wc2026/${code}.svg`;

export const WORLD_CUP_2026_FLAGS: TeamFlagInfo[] = [
  { code: 'ca', displayName: '加拿大', asset: flagPath('ca'), aliases: ['加拿大', 'canada'] },
  { code: 'mx', displayName: '墨西哥', asset: flagPath('mx'), aliases: ['墨西哥', 'mexico'] },
  { code: 'us', displayName: '美国', asset: flagPath('us'), aliases: ['美国', '美國', 'usa', 'united states', 'united states of america'] },
  { code: 'au', displayName: '澳大利亚', asset: flagPath('au'), aliases: ['澳大利亚', '澳洲', 'australia'] },
  { code: 'iq', displayName: '伊拉克', asset: flagPath('iq'), aliases: ['伊拉克', 'iraq'] },
  { code: 'ir', displayName: '伊朗', asset: flagPath('ir'), aliases: ['伊朗', 'iran', 'ir iran'] },
  { code: 'jp', displayName: '日本', asset: flagPath('jp'), aliases: ['日本', 'japan'] },
  { code: 'jo', displayName: '约旦', asset: flagPath('jo'), aliases: ['约旦', 'jordan'] },
  { code: 'kr', displayName: '韩国', asset: flagPath('kr'), aliases: ['韩国', '南韩', 'korea republic', 'south korea', 'korea'] },
  { code: 'qa', displayName: '卡塔尔', asset: flagPath('qa'), aliases: ['卡塔尔', 'qatar'] },
  { code: 'sa', displayName: '沙特阿拉伯', asset: flagPath('sa'), aliases: ['沙特', '沙特阿拉伯', 'saudi arabia'] },
  { code: 'uz', displayName: '乌兹别克斯坦', asset: flagPath('uz'), aliases: ['乌兹别克斯坦', '乌兹别克', 'uzbekistan'] },
  { code: 'dz', displayName: '阿尔及利亚', asset: flagPath('dz'), aliases: ['阿尔及利亚', 'algeria'] },
  { code: 'cv', displayName: '佛得角', asset: flagPath('cv'), aliases: ['佛得角', '佛得角群岛', 'cape verde', 'cabo verde'] },
  { code: 'cd', displayName: '刚果民主共和国', asset: flagPath('cd'), aliases: ['刚果民主共和国', '刚果（金）', '刚果金', 'dr congo', 'congo dr', 'democratic republic of the congo'] },
  { code: 'ci', displayName: '科特迪瓦', asset: flagPath('ci'), aliases: ['科特迪瓦', '象牙海岸', "cote d'ivoire", 'côte d’ivoire', 'ivory coast'] },
  { code: 'eg', displayName: '埃及', asset: flagPath('eg'), aliases: ['埃及', 'egypt'] },
  { code: 'gh', displayName: '加纳', asset: flagPath('gh'), aliases: ['加纳', 'ghana'] },
  { code: 'ma', displayName: '摩洛哥', asset: flagPath('ma'), aliases: ['摩洛哥', 'morocco'] },
  { code: 'sn', displayName: '塞内加尔', asset: flagPath('sn'), aliases: ['塞内加尔', 'senegal'] },
  { code: 'za', displayName: '南非', asset: flagPath('za'), aliases: ['南非', 'south africa'] },
  { code: 'tn', displayName: '突尼斯', asset: flagPath('tn'), aliases: ['突尼斯', 'tunisia'] },
  { code: 'cw', displayName: '库拉索', asset: flagPath('cw'), aliases: ['库拉索', '库拉çao', 'curacao', 'curaçao'] },
  { code: 'ht', displayName: '海地', asset: flagPath('ht'), aliases: ['海地', 'haiti'] },
  { code: 'pa', displayName: '巴拿马', asset: flagPath('pa'), aliases: ['巴拿马', 'panama'] },
  { code: 'ar', displayName: '阿根廷', asset: flagPath('ar'), aliases: ['阿根廷', 'argentina'] },
  { code: 'br', displayName: '巴西', asset: flagPath('br'), aliases: ['巴西', 'brazil', 'brasil'] },
  { code: 'co', displayName: '哥伦比亚', asset: flagPath('co'), aliases: ['哥伦比亚', 'colombia'] },
  { code: 'ec', displayName: '厄瓜多尔', asset: flagPath('ec'), aliases: ['厄瓜多尔', 'ecuador'] },
  { code: 'py', displayName: '巴拉圭', asset: flagPath('py'), aliases: ['巴拉圭', 'paraguay'] },
  { code: 'uy', displayName: '乌拉圭', asset: flagPath('uy'), aliases: ['乌拉圭', 'uruguay'] },
  { code: 'nz', displayName: '新西兰', asset: flagPath('nz'), aliases: ['新西兰', 'new zealand'] },
  { code: 'at', displayName: '奥地利', asset: flagPath('at'), aliases: ['奥地利', 'austria'] },
  { code: 'be', displayName: '比利时', asset: flagPath('be'), aliases: ['比利时', 'belgium'] },
  { code: 'ba', displayName: '波黑', asset: flagPath('ba'), aliases: ['波黑', '波斯尼亚和黑塞哥维那', 'bosnia and herzogovina', 'bosnia and herzegovina', 'bosnia'] },
  { code: 'hr', displayName: '克罗地亚', asset: flagPath('hr'), aliases: ['克罗地亚', 'croatia'] },
  { code: 'cz', displayName: '捷克', asset: flagPath('cz'), aliases: ['捷克', '捷克共和国', 'czechia', 'czech republic'] },
  { code: 'gb-eng', displayName: '英格兰', asset: flagPath('gb-eng'), aliases: ['英格兰', 'england'] },
  { code: 'fr', displayName: '法国', asset: flagPath('fr'), aliases: ['法国', 'france'] },
  { code: 'de', displayName: '德国', asset: flagPath('de'), aliases: ['德国', 'germany'] },
  { code: 'nl', displayName: '荷兰', asset: flagPath('nl'), aliases: ['荷兰', 'netherlands', 'holland'] },
  { code: 'no', displayName: '挪威', asset: flagPath('no'), aliases: ['挪威', 'norway'] },
  { code: 'pt', displayName: '葡萄牙', asset: flagPath('pt'), aliases: ['葡萄牙', 'portugal'] },
  { code: 'gb-sct', displayName: '苏格兰', asset: flagPath('gb-sct'), aliases: ['苏格兰', 'scotland'] },
  { code: 'es', displayName: '西班牙', asset: flagPath('es'), aliases: ['西班牙', 'spain'] },
  { code: 'se', displayName: '瑞典', asset: flagPath('se'), aliases: ['瑞典', 'sweden'] },
  { code: 'ch', displayName: '瑞士', asset: flagPath('ch'), aliases: ['瑞士', 'switzerland'] },
  { code: 'tr', displayName: '土耳其', asset: flagPath('tr'), aliases: ['土耳其', 'turkey', 'türkiye', 'turkiye'] },
];

const normalizeTeamName = (name: string) => name
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[·.\-_()[\]【】'’]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export function findWorldCupFlag(teamName: string): TeamFlagInfo | null {
  const normalized = normalizeTeamName(teamName);
  if (!normalized) return null;

  return WORLD_CUP_2026_FLAGS.find((team) =>
    team.aliases.some((alias) => {
      const normalizedAlias = normalizeTeamName(alias);
      return normalized === normalizedAlias || normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized);
    })
  ) || null;
}
