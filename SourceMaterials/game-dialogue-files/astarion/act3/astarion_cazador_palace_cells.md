# Cazador's Palace - The Cells (Sebastian's Confrontation)

**Location:** Cazador's Palace, Lower cells
**Participants:** Astarion, Sebastian (prisoner/spawn), other prisoners
**Context:** Upon entering Cazador's palace, Astarion and the party discover cells filled with prisoners - all vampire spawn marked with ritual scars. One prisoner, Sebastian, recognizes Astarion.

---

## Initial Discovery

**Narrator:** *Approaching the cells, you're met by hollow-eyed faces. There's an almost physical stink of decay and neglect.*

**Astarion:** Oh they're disgusting. Cazador never fed on wretches like this.

### If Raphael revealed the ritual's purpose:

**Astarion:** How did they get here? What is Cazador doing with them? I should have guessed there was more to it than Raphael would ever have told.

### If encountered the vampire spawn siblings but Raphael hasn't visited:

**Astarion:** How did they get here? What is Cazador doing with them? My brethren spoke nothing of this...

### If knows about the Black Mass ritual:

**Astarion:** They could be sacrifices for the Black Mass, but where did he get them all?

**Astarion:** But who knows? Maybe the old man's tastes've changed since I left.

---

## Sebastian Emerges from the Shadows

**Sebastian:** You. I know you.

*Astarion frowns and approaches the cell to get a better look at the prisoner who spoke. The prisoner steps out of the shadow - he's emaciated, filthy, and dressed in rags that were once finery.*

**Sebastian:** You're the one from the tavern. You smiled and joked and got me drunk.

**Astarion:** You - no. You're dead.

**Sebastian:** You called me so many sweet things. My name sounded like a lyric on your tongue.

**Astarion:** Sebastian.

**Sebastian:** You remember me.

**Astarion:** You were handsome. Shy. You'd never been kissed.

**Sebastian:** You taught me how. And then you destroyed me.

**Sebastian:** RAGH!

*The prisoner launches himself forward, smashing against the bars, reaching for Astarion, who steps back just in time. The prisoner collapses sobbing.*

**Astarion:** It can't be -

---

## Discovery of the Ritual Scars

### If perception check passed:

**Narrator:** *Beneath the dirt and blood, you notice that every prisoner has a rune carved into their flesh.*

#### If Astarion's scars haven't been read yet:

**Astarion:** So Cazador marked them too - bound us all to his ritual.

**Astarion:** Gods, I know so many of these faces.

#### If Astarion's scars have been read:

**Astarion:** Then they're bound to the Black Mass too. Bound through the scars. And through me.

**Astarion:** I know these faces - every one that shares my scar.

---

## The Truth Revealed

**Astarion:** It's not just him - I know so many of these faces.

**Astarion:** They're my conquests. I pursued them, seduced them, then brought them to Cazador. He told us he was feeding on them.

**Astarion:** But he turned them to spawn. He turned every last one so he'd have souls for this cursed ritual.

---

## Sebastian's Despair

**Sebastian:** How long?

**Astarion:** What?

*Sebastian gets from his knees to his feet, rising anger building.*

**Sebastian:** How long have I been down here?

**Astarion:** One hundred and seventy years. You were one of my first.

**Sebastian:** My family - my friends - they're gone...

**Sebastian:** You took them from me. You took everything from me!

---

## Offering Freedom (Good Path)

**Astarion:** That's why we're here - to destroy Cazador.

**Sebastian:** You can't. It's not possible...

**Sebastian:** And then? What happens to us?

### Alternative: If asked where Cazador is:

**Sebastian:** The grand chamber, just ahead...

**Sebastian:** But even if you can kill him - what then? What happens to us?

---

## Different Responses to Their Fate

### Option 1: Simple reassurance

**Sebastian:** Free from this nightmare? It doesn't feel possible...

**Astarion:** I promise you, I know that feeling all too well. But it can be done.

**Sebastian:** Whatever you do, just do it quickly. I can't go on waiting...

**Astarion:** We'll be back. You have my word.

### Option 2: Acknowledging the challenge

**Sebastian:** I - I don't know. It's all I've ever felt...

**Astarion:** Trust me when I say I know the feeling. But you can resist the urge.

**Sebastian:** Whatever you do, just do it quickly. I can't go on waiting...

**Astarion:** We'll be back. You have my word.

### Option 3: What he wants

**Sebastian:** I don't know. I just don't want to die down here. Please...

**Sebastian:** Whatever you do, just do it quickly. I can't go on waiting...

**Astarion:** We'll be back. You have my word.

---

## Learning About Cazador's Staff

**Sebastian:** His staff. It controls everything.

**Sebastian:** But he never sets it down - you'll never get it.

---

## Alternative: Leaving Without Promise (Neutral Path)

**Sebastian:** You can't stop him. No one can stop him.

---

## The Damned Path (Refused to Help)

> **Note:** This path occurs if the party refuses to free the prisoners or reneges on an offer to help. Excluded per bad path rules, but referenced for context - Sebastian's curse may have mechanical effects.

---

## Other Dialogue Branches

### If asked about Astarion's former living conditions:

**Astarion:** Hardly. Cazador didn't keep me in luxury, but I've never seen anything like this.

**Astarion:** I have no idea what these wretches are doing here. 'The Master' had a more refined palate than this.

### If asked who the prisoners are:

**Astarion:** I don't even know what this prison is. He hid all of this from me and the others.

#### If knows about the ritual:

**Astarion:** If I had to guess, I'd say they're part of his ritual. But where in the hells did they come from?

#### If doesn't know about the ritual:

**Astarion:** I'm just surprised to see such wretched-looking specimens - Cazador had a more refined palate than this.

---

## Flags Set

**Good Path (Promised to Return):**
- `LOW_CazadorsPalace_Cells_OM_Astarion_State_PromisedPrisoners`
- `LOW_CazadorsPalace_Cells_State_NeutralToAstarion`
- `LOW_CazadorsPalace_Cells_State_OMHappened`

**Neutral Path (Left Without Promise):**
- `LOW_CazadorsPalace_Cells_State_NeutralToAstarion`
- `LOW_CazadorsPalace_Cells_State_OMHappened`

**Additional Information:**
- `LOW_CazadorsPalce_Cells_OM_Astarion_COM_NoticedScar` (if perception passed)
- `LOW_CazadorsPalace_Cells_Knows_StaffUnlocksCells` (if asked about the key)

---

## Approval Changes

**For offering to free the prisoners:**
- Astarion: +1
- Wyll: +1
- Karlach: +1
- Minsc: +1
- Minthara: -1
