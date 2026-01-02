# DefNotes 📝✨  
A lightweight note app that turns your **user-defined terms** into a **notebook glossary** with **strict, minimal AI**.

DefNotes is built for people who write repeated concepts across notes (e.g., *dopamine*, *serotonin*, *reinforcement learning*) and want a clean way to examine these terms across different hierarchical concepts. 

---

## How It Works
You define a term inline using `def`, and DefNotes will:
- add it to the notebook’s **Glossary**
- **underline** mentions of that term across pages
- collect **all contexts** where it appears (snippets + backlinks)
- use AI to **organize/summarize those contexts** into clean bullets

---



## Example User Case

Suppose the term dopamine appears across multiple pages in a neuroscience notebook:

- “…dopamine spikes when rewards are expected…”
- “…dopamine release reinforces cue-driven behavior…”
- “…dopamine modulates the balance between direct and indirect pathways…”

---
However, often, we want to study how the concept is discussed across different contexts within the notebook. 

With DefNote, if we write 
``` def ```
before any of the ``` dopamine ``` in any of the pages of this notebook, we get the following entry in the generated glossary: 

---
### Dopamine
Mentioned in: 8 pages

Neurotransmitter involved in reward, motivation, and learning  

- Spikes when rewards are expected, supporting reward prediction and learning.
- Reinforces cue-driven behavior, linking dopamine release to reinforcement and addiction-related learning.
- Modulates the balance between direct and indirect basal ganglia pathways, influencing action selection and motor control.

## How to Use

### Requirements
- Node.js (v18+)
- pnpm
- PostgreSQL
- AI API key

### Setup

```bash
pnpm install
pnpm dev