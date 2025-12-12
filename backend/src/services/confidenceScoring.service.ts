export interface FieldMatch {
  name: boolean;
  address: boolean;
  phone: boolean;
  specialty: boolean;
  license: boolean;
}

export interface WeightedScore {
  overallConfidence: number;
  fieldScores: {
    name: number;
    address: number;
    phone: number;
    specialty: number;
    license: number;
  };
  breakdown: string[];
}

const FIELD_WEIGHTS = {
  name: 0.35,
  specialty: 0.25,
  license: 0.20,
  address: 0.15,
  phone: 0.05,
};

export class ConfidenceScoringService {
  calculateWeightedScore(matches: FieldMatch): WeightedScore {
    const fieldScores = {
      name: matches.name ? FIELD_WEIGHTS.name : 0,
      specialty: matches.specialty ? FIELD_WEIGHTS.specialty : 0,
      license: matches.license ? FIELD_WEIGHTS.license : 0,
      address: matches.address ? FIELD_WEIGHTS.address : 0,
      phone: matches.phone ? FIELD_WEIGHTS.phone : 0,
    };

    const overallConfidence = Object.values(fieldScores).reduce((sum, score) => sum + score, 0);

    const breakdown: string[] = [];
    if (!matches.name) breakdown.push('Name mismatch (-35%)');
    if (!matches.specialty) breakdown.push('Specialty mismatch (-25%)');
    if (!matches.license) breakdown.push('License not verified (-20%)');
    if (!matches.address) breakdown.push('Address mismatch (-15%)');
    if (!matches.phone) breakdown.push('Phone mismatch (-5%)');

    return {
      overallConfidence,
      fieldScores,
      breakdown,
    };
  }

  getValidationStatus(confidence: number): {
    status: 'high' | 'medium' | 'low' | 'critical';
    color: string;
    action: string;
  } {
    if (confidence >= 0.85) {
      return {
        status: 'high',
        color: 'green',
        action: 'Auto-approve (high confidence)',
      };
    } else if (confidence >= 0.70) {
      return {
        status: 'medium',
        color: 'yellow',
        action: 'Review recommended',
      };
    } else if (confidence >= 0.50) {
      return {
        status: 'low',
        color: 'orange',
        action: 'Manual review required',
      };
    } else {
      return {
        status: 'critical',
        color: 'red',
        action: 'Immediate attention needed',
      };
    }
  }

  fuzzyNameMatch(name1: string, name2: string): number {
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    if (n1 === n2) return 1.0;

    if (n1[0] === n2[0] && n1.length < 3) return 0.8;
    if (n2[0] === n1[0] && n2.length < 3) return 0.8;

    const distance = this.levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);
    const similarity = 1 - distance / maxLength;

    return similarity > 0.7 ? similarity : 0;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  phoneMatch(phone1: string, phone2: string): number {
    const p1 = this.normalizePhone(phone1);
    const p2 = this.normalizePhone(phone2);

    if (p1 === p2) return 1.0;

    if (p1.slice(-10) === p2.slice(-10)) return 0.95;

    if (p1.slice(-7) === p2.slice(-7)) return 0.7;

    return 0;
  }

  addressMatch(addr1: { city?: string; state?: string; zipCode?: string }, addr2: { city?: string; state?: string; zipCode?: string }): number {
    let score = 0;
    let totalFields = 0;

    if (addr1.zipCode && addr2.zipCode) {
      totalFields++;
      if (addr1.zipCode.substring(0, 5) === addr2.zipCode.substring(0, 5)) {
        score += 0.5;
      }
    }

    if (addr1.state && addr2.state) {
      totalFields++;
      if (addr1.state.toLowerCase() === addr2.state.toLowerCase()) {
        score += 0.3;
      }
    }

    if (addr1.city && addr2.city) {
      totalFields++;
      const cityMatch = this.fuzzyNameMatch(addr1.city, addr2.city);
      score += cityMatch * 0.2;
    }

    return totalFields > 0 ? score / (totalFields * 0.33) : 0;
  }
}

export const confidenceScoringService = new ConfidenceScoringService();
