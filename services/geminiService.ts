
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NutritionData, WorkoutPlan, User } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: {
      type: Type.STRING,
      description: "Nome do prato ou alimento identificado em português.",
    },
    weightGrams: {
      type: Type.NUMBER,
      description: "Peso estimado do alimento em gramas baseado no tamanho visual.",
    },
    calories: {
      type: Type.NUMBER,
      description: "Total de calorias para o peso estimado.",
    },
    carbs: {
      type: Type.NUMBER,
      description: "Total de carboidratos (g) para o peso estimado.",
    },
    protein: {
      type: Type.NUMBER,
      description: "Total de proteínas (g) para o peso estimado.",
    },
    fat: {
      type: Type.NUMBER,
      description: "Total de gorduras (g) para o peso estimado.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Nível de confiança da identificação de 0 a 100.",
    },
    healthScore: {
      type: Type.NUMBER,
      description: "Nota de saudabilidade de 0 a 10 (10 sendo muito saudável).",
    },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista estimada dos 3 a 5 principais ingredientes visíveis.",
    },
    insights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 2 a 3 insights nutricionais curtos.",
    },
  },
  required: ["foodName", "weightGrams", "calories", "carbs", "protein", "fat", "confidence", "healthScore"],
};

const workoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Título do plano de treino (ex: Treino ABC Hipertrofia)" },
    description: { type: Type.STRING, description: "Breve descrição do foco do treino." },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: { type: Type.STRING, description: "Nome do dia (ex: Treino A - Peito)" },
          focus: { type: Type.STRING, description: "Grupo muscular foco." },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Nome do exercício" },
                sets: { type: Type.STRING, description: "Número de séries (ex: 4)" },
                reps: { type: Type.STRING, description: "Repetições (ex: 8-12 ou Falha)" },
                rest: { type: Type.STRING, description: "Tempo de descanso (ex: 60s)" },
                tips: { type: Type.STRING, description: "Dica curta de execução" }
              },
              required: ["name", "sets", "reps", "rest"]
            }
          }
        },
        required: ["dayName", "exercises"]
      }
    }
  },
  required: ["title", "days"]
};

export const analyzeFoodImage = async (base64Image: string): Promise<NutritionData> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Você é um nutricionista brasileiro experiente. Analise esta imagem de comida. Identifique o alimento, estime o peso visualmente, calcule os macronutrientes, liste os ingredientes visíveis e dê uma nota de saúde (0-10). Responda estritamente com o JSON solicitado.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
        systemInstruction: "Sempre responda em Português do Brasil. Se a imagem não for de comida, defina 'confidence' como 0.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do modelo");

    const data = JSON.parse(text) as NutritionData;
    return data;

  } catch (error) {
    console.error("Erro na análise da imagem:", error);
    throw new Error("Falha ao analisar a imagem. Tente novamente.");
  }
};

export const generateWorkoutPlan = async (user: User): Promise<WorkoutPlan> => {
    try {
        const prompt = `Crie uma rotina de treino detalhada em JSON para uma pessoa com o seguinte perfil:
        - Idade: ${user.age || 25} anos
        - Gênero: ${user.gender || 'Não especificado'}
        - Peso: ${user.weight || 70}kg
        - Altura: ${user.height || 170}cm
        - Objetivo Principal: ${user.workoutGoal || 'Geral'}
        - Nível de Experiência: ${user.experienceLevel || 'Iniciante'}
        - Frequência: ${user.daysPerWeek || 3} dias por semana
        - Local de Treino: ${user.workoutLocation || 'Academia'}

        O treino deve ser dividido de forma lógica (ex: ABC, Full Body, Upper/Lower) adequado à frequência.
        Inclua exercícios, séries, repetições e descanso sugerido.
        Dê dicas curtas para cada exercício.
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutSchema,
                temperature: 0.4,
                systemInstruction: "Você é um personal trainer de elite brasileiro. Crie treinos seguros, eficientes e bem estruturados. Responda em Português."
            }
        });

        const text = response.text;
        if(!text) throw new Error("Falha ao gerar treino");
        
        const plan = JSON.parse(text) as WorkoutPlan;
        plan.generatedAt = Date.now();
        return plan;

    } catch (error) {
        console.error("Erro ao gerar treino:", error);
        throw new Error("Não foi possível gerar o treino no momento.");
    }
}
