export const NON_ASSIGNEE = "Non assigné";

export const lineConfig = {
  "FLEX 1": {
    client: "VALEO",
    supervisors: ["Wided Bettiaeb", "Mohamed Nasser", "Mohamed Chihaoui"],
  },
  "FLEX 2": {
  client: "VALEO",
    supervisors: [
      "Mohamed Chihaoui",
      "Youssef Riahi",
      "Adel Hammami",
    ],
  },

 
  "GEN2 C": {
    client: "VALEO",
    supervisors: [
      "Arwa Khili",
      "Hbib Arfaoui",
      "Zied Hammami",
    ],
  },

  "GEN2 R": {
    client: "VALEO",
    supervisors: [
      "Latifa Aydi",
      "Samia Riahi",
    ],
  },

  "MNG2-1": {
    client: "VALEO",
    supervisors: [
      "Sami Dhaoui",
      "Nizar Chouadhi",
      "Zied Hammami",
    ],
  },

  "MNG2-2": {
    client: "VALEO",
    supervisors: [
      "Sami Dhaoui",
      "Nizar Chouadhi",
    ],
  },

  "VM4C": {
    client: "VALEO",
    supervisors: [
      "Zied Hammami",
      "Amel Nebli",
      "Nabiha Ben Salah",
    ],
  },

  "VM4R": {
    client: "VALEO",
    supervisors: [
      "Samia Riahi",
    ],
  },
  
  "B8": {
    client: "NIDEC",
    supervisors: ["Ines Dorssa", "Wided Riahi"],
  },
  "11TA": {
    client: "NIDEC",
    supervisors: ["Ines Dorssa", "Wided Riahi"],
  },
  "10T": {
    client: "NIDEC",
    supervisors: ["Ines Dorssa", "Wided Riahi"],
  },
  "DCK": {
    client: "NIDEC",
    supervisors: ["Samia Ben Saad"],
  },
  "CM3": {
    client: "NIDEC",
    supervisors: ["Dhia Mriri", "Slah Khedhr"],
  },
  "CM4": {
    client: "NIDEC",
    supervisors: ["Dhia Mriri", "Slah Khedhr"],
  },
  
  "PIERBURG": {
    client: "PIERBURG",
    supervisors: ["Hedia Chihaoui", "Samia Ben Saad"],
  },
  "SIM": {
    client: "INTEVA",
    supervisors: ["Faten Riahi", "Haifa Ben Salah"],
  },
  "NEM": {
    client: "INTEVA",
    supervisors: ["Amal Thabet"],
  },
};

const OLD_SUPERVISEUR_SHIFTS = new Set(["Matin", "Après-midi", "Nuit"]);

export function normalizeSuperviseurValue(value) {
  const normalized = value === undefined || value === null ? "" : String(value).trim();
  if (!normalized || OLD_SUPERVISEUR_SHIFTS.has(normalized)) {
    return NON_ASSIGNEE;
  }
  return normalized;
}

const getUniqueClients = (config) => [...new Set(Object.values(config).map((item) => item.client))];

export function getClients() {
  return getUniqueClients(lineConfig);
}

export function getLinesByClient(client) {
  if (!client) {
    return [];
  }
  return Object.entries(lineConfig)
    .filter(([, item]) => item.client === client)
    .map(([line]) => line);
}

export function getSupervisorsByLine(line) {
  const config = lineConfig[line];
  if (config?.supervisors?.length) {
    return [...new Set(config.supervisors)];
  }
  return [NON_ASSIGNEE];
}

export function getSupervisorsByClient(client) {
  if (!client) {
    return getAllSupervisors();
  }

  const supervisors = Object.values(lineConfig)
    .filter((item) => item.client === client)
    .flatMap((item) => item.supervisors || []);

  return [...new Set([...supervisors, NON_ASSIGNEE])];
}

export function getAllSupervisors() {
  const supervisors = Object.values(lineConfig).flatMap((item) => item.supervisors || []);
  return [...new Set([...supervisors, NON_ASSIGNEE])];
}

export function getSupervisorOptions(filters = {}) {
  const { bu, ligne } = filters;
  if (ligne) {
    return [...new Set([...getSupervisorsByLine(ligne), NON_ASSIGNEE])];
  }
  if (bu) {
    return getSupervisorsByClient(bu);
  }
  return getAllSupervisors();
}

export const clientOptions = getClients();
export const allClientLines = Object.keys(lineConfig);
