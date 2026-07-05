import { z } from "zod";

// Base safeString validator that blocks HTML tags and script injection sequences
export const safeString = z.string().refine((val) => {
  const hasHtml = /<[^>]*>|javascript:/i.test(val);
  return !hasHtml;
}, {
  message: "Input contains disallowed HTML tags or script sequences.",
});

// Helper for optional safeStrings
export const safeStringOptional = safeString.optional().nullable();

export const LoginSchema = z.object({
  email: safeString.email("Invalid email format"),
  password: safeString,
}).strict();

export const GoogleAuthSchema = z.object({
  credential: safeString,
}).strict();

export const GoogleOnboardSchema = z.object({
  credential: safeString,
  ign: safeString.min(1, "IGN is required"),
  characterId: safeString.regex(/^\d{5,12}$/, "UID must be a valid numeric ID (5 to 12 digits)"),
}).strict();

export const MaintenanceSchema = z.object({
  maintenanceActive: z.boolean(),
}).strict();

export const ReportSchema = z.object({
  reportedProfileId: safeString,
  reasonCategory: safeString,
  additionalDetails: safeStringOptional,
}).strict();

export const ReportUpdateSchema = z.object({
  status: safeString,
}).strict();

export const RegisterSchema = z.object({
  email: safeString.email("Invalid email format"),
  password: safeString.min(6, "Password must be at least 6 characters long"),
  ign: safeString.min(1, "IGN is required"),
  characterId: safeString.regex(/^\d{5,12}$/, "UID must be a valid numeric ID (5 to 12 digits)"),
  region: safeString,
  role: safeString,
  device: safeString,
  controlSetup: safeString,
  bio: safeStringOptional,
  kdRatio: z.union([z.number(), z.string()]).transform(val => parseFloat(val as string) || 0),
  headshotPct: z.union([z.number(), z.string()]).transform(val => parseFloat(val as string) || 0),
  winRate: z.union([z.number(), z.string()]).transform(val => parseFloat(val as string) || 0),
  matchesPlayed: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 0),
  urRank: safeString,
  urPoints: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 0),
  facebook: safeStringOptional,
  instagram: safeStringOptional,
  twitter: safeStringOptional,
  discord: safeStringOptional,
  teamHistory: safeStringOptional,
  achievements: safeStringOptional,
  trophyName: safeStringOptional,
  trophyPlacement: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val !== undefined && val !== null ? parseInt(val as string) || 1 : null),
  trophyTeam: safeStringOptional,
  trophyDate: safeStringOptional,
  highlightTitle: safeStringOptional,
  highlightUrl: safeStringOptional,
  profileType: safeStringOptional,
  coachingYears: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val !== undefined && val !== null ? parseInt(val as string) || 0 : 0),
  coachingHistory: safeStringOptional,
  specialties: safeStringOptional,
}).strict();

export const AdminPlayerOnboardSchema = z.object({
  email: safeString.email("Invalid email format"),
  password: safeString.min(6, "Password must be at least 6 characters long"),
  ign: safeString.min(1, "IGN is required"),
  characterId: safeString.regex(/^\d{5,12}$/, "UID must be a valid numeric ID (5 to 12 digits)"),
  region: safeString,
  bio: safeString.optional(),
  role: safeString,
  device: safeString,
  controlSetup: safeString,
  kdRatio: z.union([z.number(), z.string()]).transform(val => parseFloat(val as string) || 0),
  headshotPct: z.union([z.number(), z.string()]).transform(val => parseFloat(val as string) || 0),
  winRate: z.union([z.number(), z.string()]).transform(val => parseFloat(val as string) || 0),
  matchesPlayed: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 0),
  urRank: safeString,
  urPoints: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 0),
  competitiveExperience: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 1),
  officialTournaments: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 0),
}).strict();

export const AdminPlayerEditSchema = z.object({
  id: safeString,
  email: safeString.email("Invalid email format").optional(),
  password: safeStringOptional,
  ign: safeString.min(1, "IGN is required").optional(),
  characterId: safeString.regex(/^\d{5,12}$/, "UID must be a valid numeric ID (5 to 12 digits)").optional(),
  region: safeString.optional(),
  bio: safeString.optional(),
  role: safeString.optional(),
  device: safeString.optional(),
  controlSetup: safeString.optional(),
  kdRatio: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseFloat(val as string) || 0 : undefined),
  headshotPct: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseFloat(val as string) || 0 : undefined),
  winRate: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseFloat(val as string) || 0 : undefined),
  matchesPlayed: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 0 : undefined),
  urRank: safeString.optional(),
  urPoints: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 0 : undefined),
  competitiveExperience: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 1 : undefined),
  officialTournaments: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 0 : undefined),
  underContract: z.boolean().optional(),
  contractStartDate: safeStringOptional,
  contractEndDate: safeStringOptional,
}).strict();

export const PlayerEditSelfSchema = z.object({
  ign: safeString.optional(),
  characterId: safeString.regex(/^\d{5,12}$/, "UID must be a valid numeric ID (5 to 12 digits)").optional(),
  status: safeString.optional(),
  avatarUrl: safeStringOptional,
  role: safeString.optional(),
  region: safeString.optional(),
  kdRatio: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseFloat(val as string) || 0 : undefined),
  headshotPct: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseFloat(val as string) || 0 : undefined),
  winRate: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseFloat(val as string) || 0 : undefined),
  matchesPlayed: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 0 : undefined),
  urRank: safeString.optional(),
  urPoints: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 0 : undefined),
  device: safeString.optional(),
  controlSetup: safeString.optional(),
  bio: safeString.optional(),
  facebook: safeStringOptional,
  instagram: safeStringOptional,
  twitter: safeStringOptional,
  discord: safeStringOptional,
  teamHistory: safeStringOptional,
  achievements: safeStringOptional,
  highestTier: safeString.optional(),
  profileType: safeString.optional(),
  coachingYears: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val !== undefined && val !== null ? parseInt(val as string) || 0 : undefined),
  coachingHistory: safeStringOptional,
  specialties: safeStringOptional,
  underContract: z.boolean().optional(),
  contractStartDate: safeStringOptional,
  contractEndDate: safeStringOptional,
  isVerified: z.boolean().optional(),
  competitiveExperience: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 1 : undefined),
  officialTournaments: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? parseInt(val as string) || 0 : undefined),
  newTrophy: z.object({
    date: safeStringOptional,
    tournamentName: safeString,
    teamRepresented: safeStringOptional,
    placement: z.union([z.number(), z.string()]).transform(val => parseInt(val as string) || 1),
  }).strict().optional().nullable(),
  newHighlight: z.object({
    title: safeString,
    videoUrl: safeString,
    thumbnailUrl: safeStringOptional,
  }).strict().optional().nullable(),
}).strict();

export const OrganizationRegisterSchema = z.object({
  email: safeString.email("Invalid email format"),
  password: safeString.min(6, "Password must be at least 6 characters long"),
  name: safeString.min(1, "Organization Name is required"),
  logoUrl: safeStringOptional,
}).strict();

export const RosterSubmitSchema = z.object({
  teamName: safeString.min(1, "Team Name is required"),
  tag: safeStringOptional,
  logoUrl: safeStringOptional,
  playerIds: z.array(safeString).min(4, "Roster must have at least 4 players").max(6, "Roster can have at most 6 players"),
}).strict();

export const RosterActionSchema = z.object({
  id: safeString.min(1, "Roster ID is required"),
  status: z.enum(["APPROVED", "REJECTED"]),
}).strict();
