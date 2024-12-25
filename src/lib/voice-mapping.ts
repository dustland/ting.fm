export type TTSProvider = "openai" | "elevenlabs" | "doubao" | "tongyi";

export interface VoiceMapping {
  openai?: string;
  elevenlabs?: string;
  doubao?: string;
  tongyi?: string;
}

export interface VoiceDefinition {
  id: string;
  name: string;
  gender: "male" | "female";
  description: string;
  mapping: VoiceMapping;
}

// Our virtual voices with their mappings to different TTS services
export const voices: VoiceDefinition[] = [
  {
    id: "professional-male",
    name: "专业男声",
    gender: "male",
    description: "专业、沉稳的男性声音",
    mapping: {
      openai: "onyx",
      elevenlabs: "pNInz6obpgDQGcFmaJgB", // Adam
      doubao: "zh_male_beijingxiaoye_moon_bigtts", // 男声-中国-rap
      tongyi: "pro_male",
    },
  },
  {
    id: "friendly-female",
    name: "亲和女声",
    gender: "female",
    description: "亲切、活泼的女性声音",
    mapping: {
      openai: "nova",
      elevenlabs: "21m00Tcm4TlvDq8ikWAM", // Rachel
      doubao: "ICL_zh_female_linjuayi_tob", // 女声-中国-少女
      tongyi: "pro_female",
    },
  },
];

export function getVoiceById(id: string): VoiceDefinition | undefined {
  return voices.find((v) => v.id === id);
}

export function getVoiceForProvider(
  voiceId: string,
  provider: TTSProvider
): string | undefined {
  const voice = getVoiceById(voiceId);
  return voice?.mapping[provider];
}

// Helper function to get all available voices
export function getAvailableVoices(): VoiceDefinition[] {
  return voices;
}
