#!/usr/bin/env python3
"""Apply all missing/truncated item fixes to journal.ts from the authoritative docx."""

import sys

FILE = 'artifacts/progress-journal/src/data/journal.ts'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

original = content
changes = []

def replace_once(old, new, label):
    global content
    count = content.count(old)
    if count != 1:
        print(f'ERROR [{label}]: found {count} occurrences (expected 1)', file=sys.stderr)
        sys.exit(1)
    content = content.replace(old, new, 1)
    changes.append(label)

# ─────────────────────────────────────────────────────────────────────────────
# 1. C&L L&A Step 10: add items b, c, d
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Shows sustained engagement and interactions when sharing a play activity with an adult."
              }
            ]
          },
          {
            "number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": [
              {
                "key": "a",
                "text": "Concentrates and listens for more than 10 minutes in adult-led activities that they enjoy."''',
    '''"text": "Shows sustained engagement and interactions when sharing a play activity with an adult."
              },
              {
                "key": "b",
                "text": "With adult help, is able to shift their full attention to the speaker and then back to an activity. Attention is becoming more flexible but can easily be distracted by other things."
              },
              {
                "key": "c",
                "text": "Picks out familiar sounds even when there is background noise: for example, 'dinner time', 'no', 'stop.'"
              },
              {
                "key": "d",
                "text": "Listens to music and responds when it is turned off: for example, stops singing or dancing."
              }
            ]
          },
          {
            "number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": [
              {
                "key": "a",
                "text": "Concentrates and listens for more than 10 minutes in adult-led activities that they enjoy."''',
    'C&L L&A Step 10: add b,c,d'
)

# ─────────────────────────────────────────────────────────────────────────────
# 2. C&L Speaking Step 5: add items f–j
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Copies gestures as part of games and familiar routines: for example, clapping hands, waving 'bye', blowing kisses, open hands for 'where is it' or 'all gone'."
              }
            ]
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "Points to objects in the environment to direct adult attention and share interest. May vocalise or make eye contact when pointing."''',
    '''"text": "Copies gestures as part of games and familiar routines: for example, clapping hands, waving 'bye', blowing kisses, open hands for 'where is it' or 'all gone'."
              },
              {
                "key": "f",
                "text": "Communicates for a range of different purposes: for example, to greet, to request, to protest, to label."
              },
              {
                "key": "g",
                "text": "Can choose between two presented objects using gesture, pointing or words/sign: \\"Do you want the ball or the car?\\""
              },
              {
                "key": "h",
                "text": "Produces symbolic noises and baby words spontaneously: for example, 'aahh' when cuddling toy, 'brmm' for car."
              },
              {
                "key": "i",
                "text": "Vocalises in attempts to copy words and sounds."
              },
              {
                "key": "j",
                "text": "Imitates familiar consonants and vowel sounds associated with frequently used toys and/or pictures: for example, 'baa-baa' for a sheep, 'moo-moo' for a cow."
              }
            ]
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "Points to objects in the environment to direct adult attention and share interest. May vocalise or make eye contact when pointing."''',
    'C&L Speaking Step 5: add f-j'
)

# ─────────────────────────────────────────────────────────────────────────────
# 3. C&L Speaking Step 7: add items b–g
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Beginning to develop expressive language at a one-word level: for example, uses at least 10 words."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",''',
    '''"text": "Beginning to develop expressive language at a one-word level: for example, uses at least 10 words."
              },
              {
                "key": "b",
                "text": "Uses verbs and adjective-type words: for example, 'go', 'sleep', 'hot', 'bit'."
              },
              {
                "key": "c",
                "text": "Uses words to comment on what's happening: for example, says/signs 'bird' if sees one in the garden."
              },
              {
                "key": "d",
                "text": "Has favourite phrases/signs that they use often: for example, 'that one'."
              },
              {
                "key": "e",
                "text": "Signs/sings along with favourite action rhyme; words may be unclear."
              },
              {
                "key": "f",
                "text": "Comments on something that has just happened: for example, says/signs 'doggy' if saw a dog on the way home, or 'fall down' if blocks have just crashed over."
              },
              {
                "key": "g",
                "text": "Uses a wide range of intonation patterns and rhythms to reflect mood: for example, excitement, interest, involvement."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",''',
    'C&L Speaking Step 7: add b-g'
)

# ─────────────────────────────────────────────────────────────────────────────
# 4. C&L Speaking Step 9: add items c–l
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Points to and names simple pictures."
              }
            ]
          },
          {
            "number": 10,
            "ageRange": "24-31 months",
            "title": "Step 10 (24-31 months)",
            "items": [
              {
                "key": "a",
                "text": "Uses words during play and almost all activities, and to ask and find out about things."''',
    '''"text": "Points to and names simple pictures."
              },
              {
                "key": "c",
                "text": "Combines words/signs into familiar phrases in the appropriate context: for example, 'Daddy come', 'There it is', 'Play with car', 'Me got one', 'Mummy gone'."
              },
              {
                "key": "d",
                "text": "Uses 'me' to refer to self."
              },
              {
                "key": "e",
                "text": "Asks simple questions using speech/sign with quizzical face."
              },
              {
                "key": "f",
                "text": "Indicates 'no' through gestures, signs or speech."
              },
              {
                "key": "g",
                "text": "Talks aloud when playing with others."
              },
              {
                "key": "h",
                "text": "Says 'please' and 'thank you' with prompts."
              },
              {
                "key": "i",
                "text": "Uses words to alert adults to needs: for example, 'hungry', 'thirsty', 'tired', to ask for help, etc."
              },
              {
                "key": "j",
                "text": "Tries saying the actual word or making a close match: for example, 'um-beya' for umbrella."
              },
              {
                "key": "k",
                "text": "Majority of single words or short phrases are intelligible to unfamiliar listeners."
              },
              {
                "key": "l",
                "text": "Repeats words or phrases from familiar stories."
              }
            ]
          },
          {
            "number": 10,
            "ageRange": "24-31 months",
            "title": "Step 10 (24-31 months)",
            "items": [
              {
                "key": "a",
                "text": "Uses words during play and almost all activities, and to ask and find out about things."''',
    'C&L Speaking Step 9: add c-l'
)

# ─────────────────────────────────────────────────────────────────────────────
# 5. C&L Speaking Step 11: fill items a–l (was empty)
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": []
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",''',
    '''"number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": [
              {
                "key": "a",
                "text": "Beginning to develop expressive language at a three-word level: for example, uses longer sentences of three to four words, such as 'Mummy go shops now.'"
              },
              {
                "key": "b",
                "text": "Retells a simple past event in correct order: for example, 'went down slide, hurt finger'."
              },
              {
                "key": "c",
                "text": "Gives information about own life and favourite things."
              },
              {
                "key": "d",
                "text": "Uses language to share feeling, experiences and thoughts."
              },
              {
                "key": "e",
                "text": "Asks increasingly detailed questions to find out information."
              },
              {
                "key": "f",
                "text": "Answers questions more fully, providing more than one piece of information."
              },
              {
                "key": "g",
                "text": "Holds a conversation, jumping from topic to topic."
              },
              {
                "key": "h",
                "text": "Uses words/signs at a three-word level for: Giving reasons; Saying what they want; Playing with others; Directing others; Telling others about things."
              },
              {
                "key": "i",
                "text": "Retells a simple story, recalling events and characters, not necessarily in the correct sequence."
              },
              {
                "key": "j",
                "text": "Beginning to use word endings: for example, going, finished."
              },
              {
                "key": "k",
                "text": "Realises the correct volume to talk at: not too loud or quiet."
              },
              {
                "key": "l",
                "text": "Likes saying learnt expressions, such as name, age or address."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",''',
    'C&L Speaking Step 11: fill a-l'
)

# ─────────────────────────────────────────────────────────────────────────────
# 6. C&L Speaking Step 14: fill items a–d (was empty)
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": []
          }
        ]
      }
    ]
  },
  {
    "area": "Physical Development",''',
    '''"number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Extends vocabulary especially by grouping and naming and exploring the meaning and sounds of new words."
              },
              {
                "key": "b",
                "text": "Uses language in play to imagine and recreate roles and experiences they hear in their community and culture."
              },
              {
                "key": "c",
                "text": "Links statements and sticks to a main theme or intention."
              },
              {
                "key": "d",
                "text": "Uses talk to organise, sequence, and clarify thinking, ideas, feeling, and events."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "area": "Physical Development",''',
    'C&L Speaking Step 14: fill a-d'
)

# ─────────────────────────────────────────────────────────────────────────────
# 7. PD Gross Motor Step 4: add items e, f, g
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Pulls to standing from crawling, holding on to furniture or person for support."
              }
            ]
          },
          {
            "number": 5,
            "ageRange": "9-13 months",
            "title": "Step 5 (9-13 months)",
            "items": [
              {
                "key": "a",
                "text": "Can reach and grasp a moving object by moving towards where the object will go."''',
    '''"text": "Pulls to standing from crawling, holding on to furniture or person for support."
              },
              {
                "key": "e",
                "text": "Can move from a sitting position to hands and knees (crawl position)."
              },
              {
                "key": "f",
                "text": "Lifts items to mouth to orally explore them."
              },
              {
                "key": "g",
                "text": "Moves around on the floor by wriggling on tummy, often moving backwards before going forwards."
              }
            ]
          },
          {
            "number": 5,
            "ageRange": "9-13 months",
            "title": "Step 5 (9-13 months)",
            "items": [
              {
                "key": "a",
                "text": "Can reach and grasp a moving object by moving towards where the object will go."''',
    'PD Gross Motor Step 4: add e,f,g'
)

# ─────────────────────────────────────────────────────────────────────────────
# 8. PD Gross Motor Step 11: add items g, h, i
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Spins self, rolls, and independently use ropes and swings."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",
            "items": [
              {
                "key": "a",
                "text": "Jumps into the air with both feet leaving the floor and can jump forward a small distance."''',
    '''"text": "Spins self, rolls, and independently use ropes and swings."
              },
              {
                "key": "g",
                "text": "Starts to catch a large ball by using two hands and their chest to trap it."
              },
              {
                "key": "h",
                "text": "Uses wheeled toys with increasing skill, such as pedalling, balancing, holding handlebars, and sitting stride."
              },
              {
                "key": "i",
                "text": "May be beginning to show preference for dominant hand and/or leg/foot."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",
            "items": [
              {
                "key": "a",
                "text": "Jumps into the air with both feet leaving the floor and can jump forward a small distance."''',
    'PD Gross Motor Step 11: add g,h,i'
)

# ─────────────────────────────────────────────────────────────────────────────
# 9. PD Fine Motor Step 5: add items c–g
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Uses index finger to point at objects, sharing attention with adult."
              }
            ]
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "Builds a tower of 2 blocks."''',
    '''"text": "Uses index finger to point at objects, sharing attention with adult."
              },
              {
                "key": "c",
                "text": "Puts toys and objects in and out of containers."
              },
              {
                "key": "d",
                "text": "Picks up small objects easily between thumb and index finger using a pincer grip."
              },
              {
                "key": "e",
                "text": "Removes pieces from inset puzzle and large pegs from a peg board with either hand."
              },
              {
                "key": "f",
                "text": "Helps turn pages of a book."
              },
              {
                "key": "g",
                "text": "Holds pen or crayon using a palmar grasp and spontaneously makes scribble marks."
              }
            ]
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "Builds a tower of 2 blocks."''',
    'PD Fine Motor Step 5: add c-g'
)

# ─────────────────────────────────────────────────────────────────────────────
# 10. PD Fine Motor Step 8: add items e–h
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Uses whole arm when markmaking."
              }
            ]
          },
          {
            "number": 9,
            "ageRange": "21-25 months",
            "title": "Step 9 (21-25 months)",
            "items": [
              {
                "key": "a",
                "text": "Fits smaller shapes and objects into holes during posting activities."''',
    '''"text": "Uses whole arm when markmaking."
              },
              {
                "key": "e",
                "text": "When holding crayons, chalks, etc., makes connections between their movements and the marks they make: draws vertical lines; produces circular scribble; produces side-to-side and to-and\\u2013fro scribble."
              },
              {
                "key": "f",
                "text": "Participates in finger and action rhymes, songs, and games, imitating the movements and anticipating actions."
              },
              {
                "key": "g",
                "text": "Hands start to operate independently during a task so that each hand is used to do something different at the same time: for example, holding a block in one hand and steadying the other block with the other hand."
              },
              {
                "key": "h",
                "text": "Looks closely at small items and creatures, and can also see items at substantial distance, comfortably changing focus from one to another."
              }
            ]
          },
          {
            "number": 9,
            "ageRange": "21-25 months",
            "title": "Step 9 (21-25 months)",
            "items": [
              {
                "key": "a",
                "text": "Fits smaller shapes and objects into holes during posting activities."''',
    'PD Fine Motor Step 8: add e-h'
)

# ─────────────────────────────────────────────────────────────────────────────
# 11. PD Fine Motor Step 11: fill items a–g (was empty)
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": []
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",
            "items": [
              {
                "key": "a",
                "text": "Manipulates a range of tools and equipment in one hand: for example, paintbrushes, scissors, hairbrushes, toothbrush, etc."''',
    '''"number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": [
              {
                "key": "a",
                "text": "Builds a tower of ten or more blocks."
              },
              {
                "key": "b",
                "text": "Imitates making a train of cubes."
              },
              {
                "key": "c",
                "text": "Holds books the correct way up and turns pages one at a time."
              },
              {
                "key": "d",
                "text": "Cuts paper with scissors, making one or two snips, although hand position may not be quite correct."
              },
              {
                "key": "e",
                "text": "Can undo large buttons."
              },
              {
                "key": "f",
                "text": "Holds pencil near its tip between first two fingers and thumb and uses it with good control to draw."
              },
              {
                "key": "g",
                "text": "Starts to copy some simple horizontal and vertical letters and numbers: for example, E, F, H, T, L and 1, 7, 4."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",
            "items": [
              {
                "key": "a",
                "text": "Manipulates a range of tools and equipment in one hand: for example, paintbrushes, scissors, hairbrushes, toothbrush, etc."''',
    'PD Fine Motor Step 11: fill a-g'
)

# ─────────────────────────────────────────────────────────────────────────────
# 12. Literacy Comprehension Step 6: add items b, c
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Enjoys listening to the same story over and over again."
              }
            ]
          },
          {
            "number": 7,
            "ageRange": "15-19 months",
            "title": "Step 7 (15-19 months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys nursery rhymes and demonstrates listening by trying to join in with actions and vocalisations. They may say some of the words in familiar songs and rhymes."''',
    '''"text": "Enjoys listening to the same story over and over again."
              },
              {
                "key": "b",
                "text": "Enjoys picture books and simple repetitive stories: for example, lift the flap books."
              },
              {
                "key": "c",
                "text": "Handles books and printed and digital reading materials with interest."
              }
            ]
          },
          {
            "number": 7,
            "ageRange": "15-19 months",
            "title": "Step 7 (15-19 months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys nursery rhymes and demonstrates listening by trying to join in with actions and vocalisations. They may say some of the words in familiar songs and rhymes."''',
    'Literacy Comprehension Step 6: add b,c'
)

# ─────────────────────────────────────────────────────────────────────────────
# 13. Literacy Word Reading Step 13: add item f
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Makes attempts at reading familiar words in picture books."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months",
            "title": "Step 14 (50-60 months)",
            "items": [
              {
                "key": "a",
                "text": "Can segment sounds (phonemes) in simple words and blend them together and knows which letters (graphemes) represent some of them: for example, when reading aloud the word 'cat', sounds out the phonemes /c/ /a/ /t/ and knows that these sounds can be written down as the graphemes 'c' 'a' 't'."''',
    '''"text": "Makes attempts at reading familiar words in picture books."
              },
              {
                "key": "f",
                "text": "Reads individual letters (grapheme) by saying sounds (phoneme) for them: for example, when the child sees the grapheme 't' they say the phoneme /t/ - this is known as a grapheme-phoneme correspondence (GPC)."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months",
            "title": "Step 14 (50-60 months)",
            "items": [
              {
                "key": "a",
                "text": "Can segment sounds (phonemes) in simple words and blend them together and knows which letters (graphemes) represent some of them: for example, when reading aloud the word 'cat', sounds out the phonemes /c/ /a/ /t/ and knows that these sounds can be written down as the graphemes 'c' 'a' 't'."''',
    'Literacy Word Reading Step 13: add f'
)

# ─────────────────────────────────────────────────────────────────────────────
# 14. Literacy Writing Step 9: add items d, e
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Scribble writes, including 'V' shape and vertical lines."
              }
            ]
          },
          {
            "number": 10,
            "ageRange": "24-31 months",
            "title": "Step 10 (24-31 months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys drawing and writing on paper and different textures, such as sand or playdough, and using touch-screen technology."''',
    '''"text": "Scribble writes, including 'V' shape and vertical lines."
              },
              {
                "key": "d",
                "text": "Enjoys drawing freely."
              },
              {
                "key": "e",
                "text": "Makes marks on their paper to stand for their name."
              }
            ]
          },
          {
            "number": 10,
            "ageRange": "24-31 months",
            "title": "Step 10 (24-31 months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys drawing and writing on paper and different textures, such as sand or playdough, and using touch-screen technology."''',
    'Literacy Writing Step 9: add d,e'
)

# ─────────────────────────────────────────────────────────────────────────────
# 15. Literacy Writing Step 12: add item h
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Includes mark making and early writing in their play."
              }
            ]
          },
          {
            "number": 13,
            "ageRange": "40-50 months",
            "title": "Step 13 (40-50 months)",
            "items": [
              {
                "key": "a",
                "text": "Writes some letters accurately."''',
    '''"text": "Includes mark making and early writing in their play."
              },
              {
                "key": "h",
                "text": "Imitates adult's writing by making continuous lines of shapes and symbols, working from left-to-right, right-to-left, or top-to-bottom, dependent upon the writing forms being used by the home/setting."
              }
            ]
          },
          {
            "number": 13,
            "ageRange": "40-50 months",
            "title": "Step 13 (40-50 months)",
            "items": [
              {
                "key": "a",
                "text": "Writes some letters accurately."''',
    'Literacy Writing Step 12: add h'
)

# ─────────────────────────────────────────────────────────────────────────────
# 16. Math Number Step 5: add items d, e, f, g
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Watches toy being hidden under a cloth and finds it immediately: showing awareness of object permanence."
              }
            ]
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "May be aware of number names through their enjoyment of action rhymes and songs that relate to numbers."''',
    '''"text": "Watches toy being hidden under a cloth and finds it immediately: showing awareness of object permanence."
              },
              {
                "key": "d",
                "text": "Drops toys deliberately and repeatedly and watches them fall to the ground."
              },
              {
                "key": "e",
                "text": "Looks in the right place for things which have moved/fallen out of sight: showing awareness of object permanence."
              },
              {
                "key": "f",
                "text": "Tries to get objects that are out of reach: for example, pulls a mat towards them to make toy come closer."
              },
              {
                "key": "g",
                "text": "Anticipates what will happen next: for example, may become distressed if the expected routine doesn't happen."
              }
            ]
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "May be aware of number names through their enjoyment of action rhymes and songs that relate to numbers."''',
    'Math Number Step 5: add d-g'
)

# ─────────────────────────────────────────────────────────────────────────────
# 17. Math Number Step 10: add item e
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Uses some number language in play to compare quantity (such as, 'all gone', 'more', 'lots', or 'same'): for example, 'milk all gone', or 'lots of worms' when digging in the mud."
              }
            ]
          },
          {
            "number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": [
              {
                "key": "a",
                "text": "Explores using a range of their own marks and signs to which they ascribe mathematical meanings."''',
    '''"text": "Uses some number language in play to compare quantity (such as, 'all gone', 'more', 'lots', or 'same'): for example, 'milk all gone', or 'lots of worms' when digging in the mud."
              },
              {
                "key": "e",
                "text": "Remembers a sequence of activities and events: for example: says 'Mummy train ice-cream'."
              }
            ]
          },
          {
            "number": 11,
            "ageRange": "30-36 months",
            "title": "Step 11 (30-36 months)",
            "items": [
              {
                "key": "a",
                "text": "Explores using a range of their own marks and signs to which they ascribe mathematical meanings."''',
    'Math Number Step 10: add e'
)

# ─────────────────────────────────────────────────────────────────────────────
# 18. NP Step 5: fix embedded labels in items a, c, f
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Looks in the right place for toys that fall out of sight: demonstrates awareness of object permanence. Awareness"',
    '"text": "Looks in the right place for toys that fall out of sight: demonstrates awareness of object permanence."',
    'NP Step 5 item a: fix Awareness label'
)
replace_once(
    '"text": "Removes pieces from inset puzzles and large pegs from pegboard. Shape"',
    '"text": "Removes pieces from inset puzzles and large pegs from pegboard."',
    'NP Step 5 item c: fix Shape label'
)
replace_once(
    '"text": "Explores differently sized and shaped objects. Measure"',
    '"text": "Explores differently sized and shaped objects."',
    'NP Step 5 item f: fix Measure label'
)

# ─────────────────────────────────────────────────────────────────────────────
# 19. NP Step 6: fix embedded labels in items a, e
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Intensely curious: exploring objects, rooms, outside areas, or, if not mobile, shows curiosity by pointing or Spatial looking at areas/objects they would like to explore."',
    '"text": "Intensely curious: exploring objects, rooms, outside areas, or, if not mobile, shows curiosity by pointing or looking at areas/objects they would like to explore."',
    'NP Step 6 item a: fix Spatial label'
)
replace_once(
    '"text": "Joins in with repeated actions in songs and stories. Pattern"',
    '"text": "Joins in with repeated actions in songs and stories."',
    'NP Step 6 item e: fix Pattern label'
)

# ─────────────────────────────────────────────────────────────────────────────
# 20. NP Step 7: fix item a text + add items b–k
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Finds toy when hidden under one of two/three identical covers laid out in a row, using visual memory to find Spatial the right cover."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",''',
    '''"text": "Finds toy when hidden under one of two/three identical covers laid out in a row, using visual memory to find the right cover."
              },
              {
                "key": "b",
                "text": "Remembers where objects belong: for example, puts toys away in right place and then finds them later."
              },
              {
                "key": "c",
                "text": "Solves simple problems independently: for example, retrieving out-of-reach toys."
              },
              {
                "key": "d",
                "text": "Investigates fitting themselves inside and moving through spaces."
              },
              {
                "key": "e",
                "text": "Stacks objects using flat surfaces."
              },
              {
                "key": "f",
                "text": "Able to sort real objects with adult support: for example, puts all the big balls together."
              },
              {
                "key": "g",
                "text": "Begin to match items in meaningful contexts: for example, finds a matching pair of shoes."
              },
              {
                "key": "h",
                "text": "Enjoys filling and emptying containers."
              },
              {
                "key": "i",
                "text": "Enjoys playing with objects of different sizes that go together and learning about the relative size of objects."
              },
              {
                "key": "j",
                "text": "Shows an interest in objects of contrasting sizes in meaningful contexts."
              },
              {
                "key": "k",
                "text": "Gets to know and enjoys daily routines."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",''',
    'NP Step 7: fix a + add b-k'
)

# ─────────────────────────────────────────────────────────────────────────────
# 21. NP Step 8: fix item d "Pattern" label
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Uses experience to predict simple cause and effect: for example, straightens tower of blocks if it wobbles. Pattern"',
    '"text": "Uses experience to predict simple cause and effect: for example, straightens tower of blocks if it wobbles."',
    'NP Step 8 item d: fix Pattern label'
)

# ─────────────────────────────────────────────────────────────────────────────
# 22. NP Step 9: fix items a, b + add items f–i
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Tries to work out problems by thinking first: for example, how to get something out of reach. Awareness"',
    '"text": "Tries to work out problems by thinking first: for example, how to get something out of reach."',
    'NP Step 9 item a: fix Awareness label'
)
replace_once(
    '"text": "Self-corrects during an activity without adult prompting: for example, tries to fit a puzzle piece in the wrong Shape space then changes to the right space."',
    '"text": "Self-corrects during an activity without adult prompting: for example, tries to fit a puzzle piece in the wrong space then changes to the right space."',
    'NP Step 9 item b: fix Shape label'
)
replace_once(
    '''"text": "Becoming familiar with patterns in daily routines: for example, 'it's snack time now and outdoor play next'."
              }
            ]
          },
          {
            "number": 10,
            "ageRange": "24-31 months",
            "title": "Step 10 (24-31 months)",''',
    '''"text": "Becoming familiar with patterns in daily routines: for example, 'it's snack time now and outdoor play next'."
              },
              {
                "key": "f",
                "text": "Remembers a sequence of activities and events: for example, to wash their hands before sitting for lunch."
              },
              {
                "key": "g",
                "text": "Joins in with and predicts what comes next in a story or rhyme."
              },
              {
                "key": "h",
                "text": "Beginning to arrange items in their own patterns: for example, lining up toys."
              },
              {
                "key": "i",
                "text": "Beginning to understand some talk about immediate past and future: for example, 'story time finished, home time soon.'"
              }
            ]
          },
          {
            "number": 10,
            "ageRange": "24-31 months",
            "title": "Step 10 (24-31 months)",''',
    'NP Step 9: add f-i'
)

# ─────────────────────────────────────────────────────────────────────────────
# 23. NP Step 10: fix items a, m
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Moves their body and toys around objects and explores fitting into spaces. Awareness"',
    '"text": "Moves their body and toys around objects and explores fitting into spaces."',
    'NP Step 10 item a: fix Awareness label'
)
replace_once(
    '"text": "Anticipates specific time-based events, such as mealtimes or home time. Pattern"',
    '"text": "Anticipates specific time-based events, such as mealtimes or home time."',
    'NP Step 10 item m: fix Pattern label'
)

# ─────────────────────────────────────────────────────────────────────────────
# 24. NP Step 11: add items c–g
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Responds to some spatial and positional language."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",''',
    '''"text": "Responds to some spatial and positional language."
              },
              {
                "key": "c",
                "text": "Explores how things look from different viewpoints, including things that are near or far away: for example, looking at a train-track when standing over it and then lying next to it; looking at a large construction made from hollow blocks/crates in the outdoor area close-up and then from the far-side of the outdoor space."
              },
              {
                "key": "d",
                "text": "Recognises that two objects have the same shape."
              },
              {
                "key": "e",
                "text": "Matches objects by size."
              },
              {
                "key": "f",
                "text": "Understands consequences of own actions: for example, if cup is knocked over the juice is spilt, etc."
              },
              {
                "key": "g",
                "text": "Joins in and anticipates repeated sound and action patterns: for example, in familiar action songs, plays with musical instruments."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",''',
    'NP Step 11: add c-g'
)

# ─────────────────────────────────────────────────────────────────────────────
# 25. NP Step 12: fix items a, b, l
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Responds to and uses language of position and direction. Spatial"',
    '"text": "Responds to and uses language of position and direction."',
    'NP Step 12 item a: fix Spatial label'
)
replace_once(
    '"text": "Predicts, moves, and rotates objects to fit the space or create the shape they would like. Awareness"',
    '"text": "Predicts, moves, and rotates objects to fit the space or create the shape they would like."',
    'NP Step 12 item b: fix Awareness label'
)
replace_once(
    '"text": "Talks about and identifies the patterns around them: for example, stripes on clothes, designs on rugs, etc. Pattern"',
    '"text": "Talks about and identifies the patterns around them: for example, stripes on clothes, designs on rugs, etc."',
    'NP Step 12 item l: fix Pattern label'
)

# ─────────────────────────────────────────────────────────────────────────────
# 26. NP Step 13: add items c–j
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Uses spatial language to describe position and give directions: for example, 'above', 'beside', 'behind', etc."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months",
            "title": "Step 14 (50-60 months)",''',
    '''"text": "Uses spatial language to describe position and give directions: for example, 'above', 'beside', 'behind', etc."
              },
              {
                "key": "c",
                "text": "Describes a familiar route."
              },
              {
                "key": "d",
                "text": "Beginning to use mathematical terms to name and describe 'solid' 3D shapes and 'flat' 2-D shapes."
              },
              {
                "key": "e",
                "text": "Attempts to create arches and enclosures when building, using trial and improvement to select blocks."
              },
              {
                "key": "f",
                "text": "Compares sizes, weights, etc. using gesture and language: 'bigger/little/smaller', 'high/low', 'tall', 'heavy'."
              },
              {
                "key": "g",
                "text": "Puts three items in the right order by length or height."
              },
              {
                "key": "h",
                "text": "Puts two items in the right order by weight or capacity."
              },
              {
                "key": "i",
                "text": "Continues, copies, and creates repeating patterns: for example, stick, leaf, stick, leaf."
              },
              {
                "key": "j",
                "text": "Begins to describe a sequence of events, real or fictional, using words such as 'first', 'then...'"
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months",
            "title": "Step 14 (50-60 months)",''',
    'NP Step 13: add c-j'
)

# ─────────────────────────────────────────────────────────────────────────────
# 27. NP Step 14: fix items a, h
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '"text": "Investigates turning and flipping objects in order to make shapes fit and creates models: predicting and Spatial visualising how they will look (spatial reasoning)."',
    '"text": "Investigates turning and flipping objects in order to make shapes fit and creates models: predicting and visualising how they will look (spatial reasoning)."',
    'NP Step 14 item a: fix Spatial label'
)
replace_once(
    '"text": "Enjoys tackling problems involving prediction and engages in discussions involving comparisons by length, weight, or capacity, paying attention to fair-testing and accuracy: for example, in considering how many Measure buckets of water it will take to fill a wheelbarrow, recognises we need to make sure the bucket is full to the same level when counting them."',
    '"text": "Enjoys tackling problems involving prediction and engages in discussions involving comparisons by length, weight, or capacity, paying attention to fair-testing and accuracy: for example, in considering how many buckets of water it will take to fill a wheelbarrow, recognises we need to make sure the bucket is full to the same level when counting them."',
    'NP Step 14 item h: fix Measure label'
)

# ─────────────────────────────────────────────────────────────────────────────
# 28. PCC Step 6: add item f
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    '''"text": "Uses real object for pretend play on self or another: for example, drinks from a cup, brushes someone's hair."
              }
            ]
          },
          {
            "number": 7,
            "ageRange": "15-19 months",
            "title": "Step 7 (15-19 months)",
            "items": [
              {
                "key": "a",
                "text": "Copies things they see and hear others doing around them, including phrases, parts of games, and actions: for example, joining in with action songs and rhymes at carpet time."''',
    '''"text": "Uses real object for pretend play on self or another: for example, drinks from a cup, brushes someone's hair."
              },
              {
                "key": "f",
                "text": "Accepts adult varying a game or pretend play and imitates and joins in with new actions/routines: for example, the child may tip toy-food on to the floor but would copy the adult then placing them into a bag."
              }
            ]
          },
          {
            "number": 7,
            "ageRange": "15-19 months",
            "title": "Step 7 (15-19 months)",
            "items": [
              {
                "key": "a",
                "text": "Copies things they see and hear others doing around them, including phrases, parts of games, and actions: for example, joining in with action songs and rhymes at carpet time."''',
    'PCC Step 6: add f'
)

# ─────────────────────────────────────────────────────────────────────────────
# Write the result
# ─────────────────────────────────────────────────────────────────────────────
if content == original:
    print('ERROR: No changes were made!', file=sys.stderr)
    sys.exit(1)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'SUCCESS: Applied {len(changes)} fixes:')
for c in changes:
    print(f'  ✓ {c}')
