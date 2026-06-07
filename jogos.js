// Tabela completa da fase de grupos — Copa do Mundo 2026
// Horários no fuso de Brasília (BRT = UTC-3)

const JOGOS = [
  // ── 1ª RODADA ──
  { id: 1, rodada: 1, data: "2026-06-11", horario: "16:00", time1: "México", time2: "África do Sul", local: "Cidade do México", grupo: "A" },
  { id: 2, rodada: 1, data: "2026-06-11", horario: "23:00", time1: "Coreia do Sul", time2: "Europa D*", local: "Guadalajara", grupo: "A" },

  { id: 3, rodada: 1, data: "2026-06-12", horario: "16:00", time1: "Canadá", time2: "Europa A*", local: "Toronto", grupo: "B" },
  { id: 4, rodada: 1, data: "2026-06-12", horario: "22:00", time1: "Estados Unidos", time2: "Paraguai", local: "Los Angeles", grupo: "D" },

  { id: 5,  rodada: 1, data: "2026-06-13", horario: "01:00", time1: "Austrália", time2: "Europa C*", local: "Vancouver", grupo: "D" },
  { id: 6,  rodada: 1, data: "2026-06-13", horario: "16:00", time1: "Catar", time2: "Suíça", local: "San Francisco", grupo: "B" },
  { id: 7,  rodada: 1, data: "2026-06-13", horario: "19:00", time1: "Brasil", time2: "Marrocos", local: "Nova York / NJ", grupo: "C" },
  { id: 8,  rodada: 1, data: "2026-06-13", horario: "22:00", time1: "Haiti", time2: "Escócia", local: "Boston", grupo: "C" },

  { id: 9,  rodada: 1, data: "2026-06-14", horario: "14:00", time1: "Alemanha", time2: "Curaçao", local: "Houston", grupo: "E" },
  { id: 10, rodada: 1, data: "2026-06-14", horario: "17:00", time1: "Holanda", time2: "Japão", local: "Dallas", grupo: "F" },
  { id: 11, rodada: 1, data: "2026-06-14", horario: "20:00", time1: "Costa do Marfim", time2: "Equador", local: "Filadélfia", grupo: "E" },
  { id: 12, rodada: 1, data: "2026-06-14", horario: "23:00", time1: "Europa B*", time2: "Tunísia", local: "Monterrey", grupo: "F" },

  { id: 13, rodada: 1, data: "2026-06-15", horario: "13:00", time1: "Espanha", time2: "Cabo Verde", local: "Atlanta", grupo: "H" },
  { id: 14, rodada: 1, data: "2026-06-15", horario: "16:00", time1: "Bélgica", time2: "Egito", local: "Seattle", grupo: "G" },
  { id: 15, rodada: 1, data: "2026-06-15", horario: "19:00", time1: "Arábia Saudita", time2: "Uruguai", local: "Miami", grupo: "H" },
  { id: 16, rodada: 1, data: "2026-06-15", horario: "22:00", time1: "Irã", time2: "Nova Zelândia", local: "Los Angeles", grupo: "G" },

  { id: 17, rodada: 1, data: "2026-06-16", horario: "14:00", time1: "Argentina", time2: "Argélia", local: "Kansas City", grupo: "J" },
  { id: 18, rodada: 1, data: "2026-06-16", horario: "16:00", time1: "França", time2: "Senegal", local: "Nova York / NJ", grupo: "I" },
  { id: 19, rodada: 1, data: "2026-06-16", horario: "19:00", time1: "Repescagem 2*", time2: "Noruega", local: "Boston", grupo: "I" },

  { id: 20, rodada: 1, data: "2026-06-17", horario: "01:00", time1: "Áustria", time2: "Jordânia", local: "San Francisco", grupo: "J" },
  { id: 21, rodada: 1, data: "2026-06-17", horario: "14:00", time1: "Portugal", time2: "Repescagem 1*", local: "Houston", grupo: "K" },
  { id: 22, rodada: 1, data: "2026-06-17", horario: "17:00", time1: "Inglaterra", time2: "Croácia", local: "Dallas", grupo: "L" },
  { id: 23, rodada: 1, data: "2026-06-17", horario: "20:00", time1: "Gana", time2: "Panamá", local: "Toronto", grupo: "L" },
  { id: 24, rodada: 1, data: "2026-06-17", horario: "23:00", time1: "Uzbequistão", time2: "Colômbia", local: "Cidade do México", grupo: "K" },

  // ── 2ª RODADA ──
  { id: 25, rodada: 2, data: "2026-06-18", horario: "13:00", time1: "Europa D*", time2: "África do Sul", local: "Atlanta", grupo: "A" },
  { id: 26, rodada: 2, data: "2026-06-18", horario: "16:00", time1: "Suíça", time2: "Europa A*", local: "Los Angeles", grupo: "B" },
  { id: 27, rodada: 2, data: "2026-06-18", horario: "19:00", time1: "Canadá", time2: "Catar", local: "Vancouver", grupo: "B" },
  { id: 28, rodada: 2, data: "2026-06-18", horario: "22:00", time1: "México", time2: "Coreia do Sul", local: "Guadalajara", grupo: "A" },

  { id: 29, rodada: 2, data: "2026-06-19", horario: "01:00", time1: "Europa C*", time2: "Paraguai", local: "San Francisco", grupo: "D" },
  { id: 30, rodada: 2, data: "2026-06-19", horario: "16:00", time1: "Estados Unidos", time2: "Austrália", local: "Seattle", grupo: "D" },
  { id: 31, rodada: 2, data: "2026-06-19", horario: "19:00", time1: "Escócia", time2: "Marrocos", local: "Boston", grupo: "C" },
  { id: 32, rodada: 2, data: "2026-06-19", horario: "22:00", time1: "Brasil", time2: "Haiti", local: "Filadélfia", grupo: "C" },

  { id: 33, rodada: 2, data: "2026-06-20", horario: "14:00", time1: "Holanda", time2: "Europa B*", local: "Houston", grupo: "F" },
  { id: 34, rodada: 2, data: "2026-06-20", horario: "17:00", time1: "Alemanha", time2: "Costa do Marfim", local: "Toronto", grupo: "E" },
  { id: 35, rodada: 2, data: "2026-06-20", horario: "21:00", time1: "Equador", time2: "Curaçao", local: "Kansas City", grupo: "E" },

  { id: 36, rodada: 2, data: "2026-06-21", horario: "01:00", time1: "Tunísia", time2: "Japão", local: "Monterrey", grupo: "F" },
  { id: 37, rodada: 2, data: "2026-06-21", horario: "13:00", time1: "Espanha", time2: "Arábia Saudita", local: "Atlanta", grupo: "H" },
  { id: 38, rodada: 2, data: "2026-06-21", horario: "16:00", time1: "Bélgica", time2: "Irã", local: "Los Angeles", grupo: "G" },
  { id: 39, rodada: 2, data: "2026-06-21", horario: "19:00", time1: "Uruguai", time2: "Cabo Verde", local: "Miami", grupo: "H" },
  { id: 40, rodada: 2, data: "2026-06-21", horario: "22:00", time1: "Nova Zelândia", time2: "Egito", local: "Vancouver", grupo: "G" },

  { id: 41, rodada: 2, data: "2026-06-22", horario: "14:00", time1: "Argentina", time2: "Áustria", local: "Dallas", grupo: "J" },
  { id: 42, rodada: 2, data: "2026-06-22", horario: "18:00", time1: "França", time2: "Repescagem 2*", local: "Filadélfia", grupo: "I" },
  { id: 43, rodada: 2, data: "2026-06-22", horario: "21:00", time1: "Noruega", time2: "Senegal", local: "Nova York / NJ", grupo: "I" },

  { id: 44, rodada: 2, data: "2026-06-23", horario: "00:00", time1: "Jordânia", time2: "Argélia", local: "San Francisco", grupo: "J" },
  { id: 45, rodada: 2, data: "2026-06-23", horario: "14:00", time1: "Portugal", time2: "Uzbequistão", local: "Houston", grupo: "K" },
  { id: 46, rodada: 2, data: "2026-06-23", horario: "17:00", time1: "Inglaterra", time2: "Gana", local: "Boston", grupo: "L" },
  { id: 47, rodada: 2, data: "2026-06-23", horario: "20:00", time1: "Panamá", time2: "Croácia", local: "Toronto", grupo: "L" },
  { id: 48, rodada: 2, data: "2026-06-23", horario: "23:00", time1: "Colômbia", time2: "Repescagem 1*", local: "Guadalajara", grupo: "K" },

  // ── 3ª RODADA ──
  { id: 49, rodada: 3, data: "2026-06-24", horario: "16:00", time1: "Suíça", time2: "Canadá", local: "Vancouver", grupo: "B" },
  { id: 50, rodada: 3, data: "2026-06-24", horario: "16:00", time1: "Europa A*", time2: "Catar", local: "Seattle", grupo: "B" },
  { id: 51, rodada: 3, data: "2026-06-24", horario: "19:00", time1: "Escócia", time2: "Brasil", local: "Miami", grupo: "C" },
  { id: 52, rodada: 3, data: "2026-06-24", horario: "19:00", time1: "Marrocos", time2: "Haiti", local: "Atlanta", grupo: "C" },
  { id: 53, rodada: 3, data: "2026-06-24", horario: "22:00", time1: "Europa D*", time2: "México", local: "Cidade do México", grupo: "A" },
  { id: 54, rodada: 3, data: "2026-06-24", horario: "22:00", time1: "África do Sul", time2: "Coreia do Sul", local: "Monterrey", grupo: "A" },

  { id: 55, rodada: 3, data: "2026-06-25", horario: "17:00", time1: "Equador", time2: "Alemanha", local: "Nova York / NJ", grupo: "E" },
  { id: 56, rodada: 3, data: "2026-06-25", horario: "17:00", time1: "Curaçao", time2: "Costa do Marfim", local: "Filadélfia", grupo: "E" },
  { id: 57, rodada: 3, data: "2026-06-25", horario: "20:00", time1: "Japão", time2: "Europa B*", local: "Dallas", grupo: "F" },
  { id: 58, rodada: 3, data: "2026-06-25", horario: "20:00", time1: "Tunísia", time2: "Holanda", local: "Kansas City", grupo: "F" },
  { id: 59, rodada: 3, data: "2026-06-25", horario: "23:00", time1: "Europa C*", time2: "Estados Unidos", local: "Los Angeles", grupo: "D" },
  { id: 60, rodada: 3, data: "2026-06-25", horario: "23:00", time1: "Paraguai", time2: "Austrália", local: "San Francisco", grupo: "D" },

  { id: 61, rodada: 3, data: "2026-06-26", horario: "16:00", time1: "Noruega", time2: "França", local: "Boston", grupo: "I" },
  { id: 62, rodada: 3, data: "2026-06-26", horario: "16:00", time1: "Senegal", time2: "Repescagem 2*", local: "Toronto", grupo: "I" },
  { id: 63, rodada: 3, data: "2026-06-26", horario: "21:00", time1: "Cabo Verde", time2: "Arábia Saudita", local: "Houston", grupo: "H" },
  { id: 64, rodada: 3, data: "2026-06-26", horario: "21:00", time1: "Uruguai", time2: "Espanha", local: "Guadalajara", grupo: "H" },

  { id: 65, rodada: 3, data: "2026-06-27", horario: "00:00", time1: "Egito", time2: "Irã", local: "Seattle", grupo: "G" },
  { id: 66, rodada: 3, data: "2026-06-27", horario: "00:00", time1: "Nova Zelândia", time2: "Bélgica", local: "Vancouver", grupo: "G" },
  { id: 67, rodada: 3, data: "2026-06-27", horario: "18:00", time1: "Panamá", time2: "Inglaterra", local: "Nova York / NJ", grupo: "L" },
  { id: 68, rodada: 3, data: "2026-06-27", horario: "18:00", time1: "Croácia", time2: "Gana", local: "Filadélfia", grupo: "L" },
  { id: 69, rodada: 3, data: "2026-06-27", horario: "20:30", time1: "Colômbia", time2: "Portugal", local: "Miami", grupo: "K" },
  { id: 70, rodada: 3, data: "2026-06-27", horario: "20:30", time1: "Repescagem 1*", time2: "Uzbequistão", local: "Atlanta", grupo: "K" },
  { id: 71, rodada: 3, data: "2026-06-27", horario: "23:00", time1: "Argélia", time2: "Áustria", local: "Kansas City", grupo: "J" },
  { id: 72, rodada: 3, data: "2026-06-27", horario: "23:00", time1: "Jordânia", time2: "Argentina", local: "Dallas", grupo: "J" },
];

// * Times ainda a confirmar na repescagem:
//   Europa A = Itália, Irlanda do Norte, País de Gales ou Bósnia-Herzegovina
//   Europa B = Ucrânia, Suécia, Polônia ou Albânia
//   Europa C = Turquia, Romênia, Eslováquia ou Kosovo
//   Europa D = Dinamarca, Macedônia do Norte, República Tcheca ou Irlanda
//   Repescagem 1 = RD Congo, Jamaica ou Nova Caledônia
//   Repescagem 2 = Iraque, Bolívia ou Suriname
