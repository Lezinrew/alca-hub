import React from "react";

export const SERVICE_CATEGORIES_DATA = [
  {
    categoria: "Beleza",
    serviços: [
      "Cabeleireiro", "Manicure e Pedicure", "Maquiador", "Depiladora",
      "Designer de sobrancelhas", "Barbeiro", "Micropigmentador",
      "Esteticista", "Podóloga", "Bronzeadora", "Colorista"
    ]
  },
  {
    categoria: "Saúde",
    serviços: [
      "Fisioterapeuta", "Psicólogo", "Nutricionista", "Fonoaudiólogo",
      "Acupunturista", "Enfermeira", "Esteticista Facial", "Massoterapeuta",
      "Terapias Integrativas", "Educador Físico"
    ]
  },
  {
    categoria: "Casa e Construção",
    serviços: [
      "Pedreiro", "Encanador", "Eletricista", "Gesseiro", "Pintor",
      "Azulejista", "Vidraceiro", "Carpinteiro", "Marceneiro", "Armador",
      "Serralheiro", "Bombeiro hidráulico"
    ]
  },
  {
    categoria: "Educação",
    serviços: [
      "Professor Particular", "Reforço Escolar", "Aulas de Música",
      "Aulas de Idiomas", "Preparatório para Concursos", "Alfabetizador"
    ]
  },
  {
    categoria: "Animais",
    serviços: [
      "Veterinário", "Passeador de cães", "Pet Sitter", "Adestrador",
      "Tosador", "Banho e Tosa", "Hospedagem para pets"
    ]
  },
  {
    categoria: "Eventos",
    serviços: [
      "Fotógrafo", "Filmagem", "Decoração", "Buffet", "Garçom",
      "Barman", "Cerimonialista", "Som e Iluminação", "Mestre de Cerimônias"
    ]
  },
  {
    categoria: "Serviços Domésticos",
    serviços: [
      "Diarista", "Faxineira", "Babá", "Cozinheira", "Passadeira", 
      "Caseiro", "Cuidador de Idosos"
    ]
  },
  {
    categoria: "Automotivo",
    serviços: [
      "Mecânico", "Auto Elétrico", "Funileiro", "Martelinho de Ouro",
      "Chaveiro", "Instalador de Som", "Lavagem e Polimento"
    ]
  },
  {
    categoria: "Tecnologia",
    serviços: [
      "Suporte Técnico", "Instalador de Internet", "Designer Gráfico",
      "Programador", "Editor de Vídeo", "Marketing Digital"
    ]
  }
];

export default function ServiceCategories() {
  const data = SERVICE_CATEGORIES_DATA;
  return (
    <div className="p-4 space-y-8">
      {data.map((cat, index) => (
        <div key={index} className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{cat.categoria}</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {cat.serviços.map((servico, idx) => (
              <li key={idx}>{servico}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


