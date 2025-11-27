# interviews.study  
AI-Driven Mock Interview Platform with Retrieval and Agent Workflows  
  
interviews.study is a full AI interview-prep platform built with Next.js, TypeScript, Supabase, PostgreSQL, OpenAI, and LangChain. It combines retrieval-augmented generation, embeddings search, and agent-based evaluation to simulate realistic technical interviews.  
  
## ✨ Core Features  
  
### **Intelligent Question Engine**  
A retrieval module powered by pgvector + OpenAI embeddings.  
- Semantic search over curated interview datasets  
- Role-aware question selection  
- Difficulty adaptation based on previous responses  
  
### **Multi-Turn Interview Sessions**  
A LangChain agent handles follow-ups, evaluation, and state management.  
- Context-preserved conversations  
- Structured feedback on reasoning, clarity, and correctness  
- Response evaluation using model-generated rubrics  
  
### **RAG Architecture**  
The platform blends structured role data with unstructured knowledge:  
- Custom chunking strategy for interview content  
- Embeddings indexed in Supabase  
- Hybrid retrieval combining metadata and semantic vectors  
  
### **System Design**  
**Frontend:** Next.js + TypeScript + shadcn/ui  
**Backend:** Supabase functions + Postgres + row-level security  
**AI Layer:** OpenAI models + LangChain pipelines  
**Storage:** Supabase + pgvector  
**Deployment:** Vercel + Supabase edge functions  
  
### **Pipeline Overview**  
1. User selects a role or topic  
2. System performs semantic search via LangChain’s retriever  
3. The agent constructs a question and evaluates responses  
4. Interview history persists for personalized improvement  
  
### **Future Expansions**  
- Multi-agent evaluation for different scoring dimensions  
- Voice-based interviews with Whisper + TTS  
- Scenario-based system design interviews  
- LLM-graded coding challenges with static analysis
