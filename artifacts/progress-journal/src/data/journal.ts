// Auto-generated from EYIT Development Journal (September 2024)
// Adapted from Special Educational Needs & Inclusion Team, Learning Inclusion Service, Leeds City Council.

export type Status = null | "emerging" | "developing" | "secure";

export interface JournalItem { key: string; text: string; }
export interface JournalStep { number: number; ageRange: string; title: string; items: JournalItem[]; description?: string; note?: boolean; }
export interface JournalStrand { name: string; steps: JournalStep[]; }
export interface JournalArea { area: string; strands: JournalStrand[]; }

// Colours taken directly from the EYIT Development Journal (September 2024)
// .docx shading fills — one per area, in JOURNAL order.
export const AREA_COLORS: Record<string, string> = {
  "Personal, Social and Emotional Development": "#FBD4B4",
  "Communication and Language":                 "#B6DDE8",
  "Physical Development":                        "#CCC0D9",
  "Literacy":                                    "#D6E3BC",
  "Mathematics":                                 "#E5B8B7",
  "Understanding the World":                     "#B8CCE4",
  "Expressive Arts and Design":                  "#C4BC96",
};

export const JOURNAL: JournalArea[] = [
  {
    "area": "Personal, Social and Emotional Development",
    "strands": [
      {
        "name": "SELF-REGULATION",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Is comforted by touch: for example, responds to calming input, such as patting, rocking, wrapping, cuddling."
              },
              {
                "key": "b",
                "text": "Cries to express needs: for example, hunger, anger, pain."
              },
              {
                "key": "c",
                "text": "Sucks on hands, clothes, and/or pacifier to calm self."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Calms from being upset when held, rocked, spoken, or sung to with soothing voice."
              },
              {
                "key": "b",
                "text": "Shows emotional responses to other people’s emotions: for example, smiles when smiled at; becomes distressed if hears another child crying; sees a blank unresponsive face."
              },
              {
                "key": "c",
                "text": "Smiles at a familiar person."
              },
              {
                "key": "d",
                "text": "Shows distress at being left alone."
              },
              {
                "key": "e",
                "text": "Becomes excited in anticipation of play/interaction: for example, waves arms/legs, vocalises."
              },
              {
                "key": "f",
                "text": "Laughs to express pleasure."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Responds to facial expressions of happiness/sadness in others: for example, smiles if adult smiles, frowns if adult frowns."
              },
              {
                "key": "b",
                "text": "Laughs and squeals when happy or excited."
              },
              {
                "key": "c",
                "text": "Gets upset if toy is taken away from them."
              },
              {
                "key": "d",
                "text": "Shows shyness or anxiety if approached by a stranger when familiar adult is out of sight. Is wary of unfamiliar events."
              },
              {
                "key": "e",
                "text": "Can tolerate short separations from parent/carer but shows pleasure at return."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Shows more differentiated feelings/emotions: for example, joy, fear, anger, surprise; using crying, gestures, and vocalisations freely to express their needs."
              },
              {
                "key": "b",
                "text": "Reacts to an audience: for example, repeats an activity/action that is received positively."
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
                "text": "Makes body stiff and vocalises when protesting."
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
                "text": "Uses comfort toy or object to calm self."
              },
              {
                "key": "b",
                "text": "Uses a comfort object, familiar others, routines, or spaces to soothe themselves, particularly when separated from their close carer."
              },
              {
                "key": "c",
                "text": "Uses parent/carer for ‘emotional refuelling’ when feeling tired, stressed, or frustrated: for example, stops playing to have a cuddle; sits quietly snuggled in on carer’s lap for a few minutes; asks for favourite story; etc."
              },
              {
                "key": "d",
                "text": "Clings to special person and hides face when feeling scared or overwhelmed."
              },
              {
                "key": "e",
                "text": "Becomes more able to adapt their behaviour and increase their participation and co-operation as they become familiar with and anticipate routines."
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
                "text": "Responds to a small number of boundaries with encouragement and support."
              },
              {
                "key": "b",
                "text": "Shows defiance: for example, indicates verbally and/or non-verbally a refusal to cooperate."
              },
              {
                "key": "c",
                "text": "Aware of other people’s feelings: for example, looks concerned if hears crying or looks excited if hears familiar happy voice."
              },
              {
                "key": "d",
                "text": "Watches the emotional reactions of a parent/carer and uses them as a guide in new situations: for example, watches parent/carer’s face before approaching a strange dog or climbing steps on slide, and stops if parent/carer looks anxious."
              },
              {
                "key": "e",
                "text": "Uses parent/carer as secure base from which to explore independently in new environments: for example, ventures away from parent/carer to play and interact with others but returns if becomes anxious."
              },
              {
                "key": "f",
                "text": "Find ways of managing transitions: for example, from their parent to their key person."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Starts to share and ‘give and take’."
              },
              {
                "key": "b",
                "text": "Expresses positive feelings such as joy and affection and negative feelings such as anger, frustration, and distress through actions, behaviours, and a few words, and seeks reaction."
              },
              {
                "key": "c",
                "text": "May intentionally hurt another person if frustrated, angry, or misunderstood: for example, may hit another child if they take a toy away."
              },
              {
                "key": "d",
                "text": "Asserts their own agenda strongly and may display frustration with having to comply with others’ agendas and with change and boundaries."
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
                "text": "Understands that some things are theirs, some things are shared, and some things belong to other people."
              },
              {
                "key": "b",
                "text": "Defends own possessions."
              },
              {
                "key": "c",
                "text": "Grow in independence, rejecting help (‘me do it’, ‘No!’). Knows own mind and expresses it, asserting their likes and dislikes, choices, decisions, and ideas. Sometimes this leads to feelings of frustration and tantrums."
              },
              {
                "key": "d",
                "text": "Understands causes of some feelings: for example, feels sad because a toy is broken; frustrated when can’t go out to play."
              },
              {
                "key": "e",
                "text": "Is aware of others’ feelings and is Emerging to show empathy by offering a comfort object to another child or sharing in another child’s excitement."
              },
              {
                "key": "f",
                "text": "Conscious of adult approval or disapproval for their own actions: for example, checks to see if adult is looking before acting; looks guilty if seen acting in a manner that may be disapproved."
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
                "text": "Shows understanding of some rules and routines."
              },
              {
                "key": "b",
                "text": "Participates more in collective cooperation as their experience of routines and understanding of some boundaries grows."
              },
              {
                "key": "c",
                "text": "Shows affection towards other children and younger siblings."
              },
              {
                "key": "d",
                "text": "Is jealous of sharing parent/carers’ attention."
              },
              {
                "key": "e",
                "text": "Can feel overwhelmed by intense emotions, resulting in an emotional collapse when frightened, frustrated, angry, anxious, or overstimulated."
              },
              {
                "key": "f",
                "text": "Seeks comfort from familiar adults when needed and distracts themselves with a comfort object when upset."
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
                "text": "Understands they have to share and take turns but might not always be willing to do so."
              },
              {
                "key": "b",
                "text": "Know they cannot always have what they want when they want it."
              },
              {
                "key": "c",
                "text": "Generally, more co-operative and amenable to family rules: for example, has fewer tantrums."
              },
              {
                "key": "d",
                "text": "Demonstrates concern for others when they are upset: for example, offers favourite toy; offers cuddle; etc."
              },
              {
                "key": "e",
                "text": "Emerging to understand that own actions affect other people. In favourable conditions, begins to stop themselves from doing something they should not do."
              },
              {
                "key": "f",
                "text": "Begin to show ‘effortful control’: for example, waiting for a turn and resisting the strong impulse to grab what they want or push their way to the front."
              },
              {
                "key": "g",
                "text": "Expresses the self-aware emotions of pride and embarrassment as well as a wide range of other feelings."
              },
              {
                "key": "h",
                "text": "Be increasingly able to think about, talk about, and manage their emotions. Safely explore emotions beyond their normal range through play and stories. Talk about their feelings in more elaborated ways: ‘I’m sad because…’ or ‘I love it when …’"
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
                "text": "Is sometimes stubborn or negative and reacts with annoyance to frustration."
              },
              {
                "key": "b",
                "text": "Expresses a wide range of feelings in their interactions with others and through their behaviour and play, including excitement and anxiety, guilt and self-doubt."
              },
              {
                "key": "c",
                "text": "May exhibit increased fearfulness of things like the dark or monsters, etc., and possibly have nightmares."
              },
              {
                "key": "d",
                "text": "Remember rules without needing an adult to remind them."
              },
              {
                "key": "e",
                "text": "Talk about their feelings using words like ‘happy’, ‘sad’, ‘angry’, or ‘worried’."
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
                "text": "Often actively seeks sharing and fairness."
              },
              {
                "key": "b",
                "text": "Is curious about others and can adapt behaviour to fit in with different events and social situations: for example, removing socks and shoes before going on slide after seeing others doing this."
              },
              {
                "key": "c",
                "text": "Understands own actions affect other people: for example, becomes upset or tries to comfort another child when they realise they have upset them."
              },
              {
                "key": "d",
                "text": "Shows care and concern for others: living things and the environment."
              },
              {
                "key": "e",
                "text": "Find solutions to conflicts and rivalries: for example, accepting that not everyone can be Spider-Man in the game and suggesting other ideas. Talk with others to solve conflicts."
              },
              {
                "key": "f",
                "text": "Talks about how others might be feeling and responds according to their understanding of the other person’s needs/wants."
              },
              {
                "key": "g",
                "text": "Understands that expectations vary depending on different events, social situations, and changes in routine, and, in favourable conditions, becomes more able to adapt their behaviour."
              },
              {
                "key": "h",
                "text": "Increasingly follow rules, understanding why they are important."
              },
              {
                "key": "i",
                "text": "Develop appropriate ways of being assertive."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys and joins in with shared play appropriately: for example, turn-taking and sharing."
              },
              {
                "key": "b",
                "text": "Understands their own and other people’s feelings, offering empathy and comfort. Attempts to repair a relationship or situation where they have caused upset, and understands how their actions impact other people."
              },
              {
                "key": "c",
                "text": "Is more able to manage their feelings and tolerate situations in which their wishes cannot be met."
              }
            ]
          }
        ]
      },
      {
        "name": "MANAGING SELF",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Makes sounds such as gurgles, coos."
              },
              {
                "key": "b",
                "text": "Smiles at interesting objects."
              },
              {
                "key": "c",
                "text": "Smiles in response to touch or sound."
              },
              {
                "key": "d",
                "text": "Responds to being rocked as a means of soothing."
              },
              {
                "key": "e",
                "text": "Opens mouth to feed when corner of mouth is touched."
              },
              {
                "key": "f",
                "text": "Sucking is strong and rhythmic with co-ordinated swallowing."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Makes needs known through crying and body movements. Uses different sounds/cries to show hunger, tiredness, pain. Expresses discomfort, hunger or thirst, distress, and need for holding or moving."
              },
              {
                "key": "b",
                "text": "Responds to and thrives on warm, sensitive, physical contact and care."
              },
              {
                "key": "c",
                "text": "Produces and copies non-speech sounds: for example, coos, raspberries."
              },
              {
                "key": "d",
                "text": "Smiles at non-moving object or picture."
              },
              {
                "key": "e",
                "text": "Smiles or makes sounds in response to eye contact."
              },
              {
                "key": "f",
                "text": "Learns about their physical self through exploratory play with their hands and feet and movement."
              },
              {
                "key": "g",
                "text": "Responds and turns to sounds, especially voices."
              },
              {
                "key": "h",
                "text": "Settles to sleep with calming input when tired."
              },
              {
                "key": "i",
                "text": "Sleeps more at night than in the day."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Shows pleasure at being tickled and other physical games."
              },
              {
                "key": "b",
                "text": "Expresses awareness of their physical self through their own movements, gestures, and expressions and by touching their own and other’s faces, eyes, and mouth in play and care events."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Uses voice or gesture to refuse: for example, pushing object away, shaking head."
              },
              {
                "key": "b",
                "text": "Laughs during games with familiar adult."
              },
              {
                "key": "c",
                "text": "Shows delight at active play: for example, rough and tumble, tickling."
              },
              {
                "key": "d",
                "text": "Repeats enjoyable activity: for example, pushing buttons on a musical toy."
              },
              {
                "key": "e",
                "text": "Demonstrates motivation and curiosity when exploring a new and interesting object, using a variety of senses."
              },
              {
                "key": "f",
                "text": "Shows attachment to special people: for example, distressed when separated, stays close, and shows affection."
              },
              {
                "key": "g",
                "text": "Shows an interest in their reflection in a mirror (for example, smiles at image of self in mirror), although may not yet realise that the reflection is them."
              },
              {
                "key": "h",
                "text": "Shows awareness of being a separate individual through initiating contact with others using voice, gesture, eye contact, and facial expression."
              },
              {
                "key": "i",
                "text": "Shows growing confidence that their needs will be met by freely expressing their need for comfort, nourishment, or company."
              },
              {
                "key": "j",
                "text": "Anticipates bedtime due to routine: for example, bath/pyjamas/drink/story, then expects to be put down."
              },
              {
                "key": "k",
                "text": "Alert for periods of increasing length, interspersed with naps."
              },
              {
                "key": "l",
                "text": "Tolerates teeth and gum cleaning routine as teeth emerge. First teeth usually appear: two lower incisors, then two upper."
              },
              {
                "key": "m",
                "text": "Communicates discomfort or distress with wet or soiled nappy."
              },
              {
                "key": "n",
                "text": "No longer requires feeding at night."
              },
              {
                "key": "o",
                "text": "Anticipates food routines with interest."
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
                "text": "Expresses feelings (such as joy, distress, frustration, and fear) and communicates them through gesture, facial expression, movements, body language, and vocalisations."
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
                "text": "Laughs in anticipation: for example, waiting for tickle in ‘round the garden’."
              },
              {
                "key": "b",
                "text": "Uses other person to help achieve a goal: for example, to get an object out of reach; activate a wind-up toy."
              },
              {
                "key": "c",
                "text": "Laughs at discrepancies: for example, putting shoe on head."
              },
              {
                "key": "d",
                "text": "Becomes distressed if intended action is thwarted: for example, when stopped from throwing a toy."
              },
              {
                "key": "e",
                "text": "Starts to communicate urination and bowel movements through facial expression and body movements."
              },
              {
                "key": "f",
                "text": "Grasps finger foods and brings them to mouth, and shares control of spoon and bottle or cup."
              },
              {
                "key": "g",
                "text": "Attempts to use spoon or other utensil: can guide towards mouth but food often falls off."
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
                "text": "Explores new toys and environments but looks back or moves back to familiar adult to ‘check in’."
              },
              {
                "key": "b",
                "text": "Aware of and interested in their own and others’ physical characteristics, pointing to and naming features (nose, hair, etc.)."
              },
              {
                "key": "c",
                "text": "Understands that their own voice and actions causes an effect on others: for example, clapping hands starts a game; repeats an action which is received positively by a smile or applause."
              },
              {
                "key": "d",
                "text": "Shows separation anxiety as they become more aware of themselves as separate individuals."
              },
              {
                "key": "e",
                "text": "Is persistent in completing tasks and activities with more than one part: for example, puzzle, posting, etc."
              },
              {
                "key": "f",
                "text": "Shows pride and pleasure in new accomplishments."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Experiments with what their bodies can do through setting themselves physical challenges: for example, pulling a large truck upstairs."
              },
              {
                "key": "b",
                "text": "Helps with dressing: for example, holds out arm for sleeve or foot for shoe."
              },
              {
                "key": "c",
                "text": "Is aware of where clothes are kept: for example, outdoor coat and shoes by the door."
              },
              {
                "key": "d",
                "text": "Starts to help with dress and hygiene routines: for example, holds out arm/foot; brushes own hair."
              },
              {
                "key": "e",
                "text": "Participates in bedtime routine."
              },
              {
                "key": "f",
                "text": "Tolerates use of toothbrush and paste. Generally, has up to 12 teeth. Willing to allow baby toothbrush to be used on teeth."
              },
              {
                "key": "g",
                "text": "Holds cup with both hands and drinks without spilling much."
              },
              {
                "key": "h",
                "text": "Scoops food onto spoon independently."
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
                "text": "Starts interaction with other children: for example, will often watch, follow and imitate others in their play; begin to cooperate within shared-play activities with other children."
              },
              {
                "key": "b",
                "text": "Grow in independence, rejecting help (‘me do it’, ‘No!’). Knows own mind and expresses it, asserting their likes and dislikes, choices, decisions, and ideas. Sometimes this leads to feelings of frustration and tantrums."
              },
              {
                "key": "c",
                "text": "Begins to use ‘me’, ‘you’ and ‘I’ in their talk and to show awareness of their social identity of gender, ethnicity, and ability."
              },
              {
                "key": "d",
                "text": "Enjoys hugs and cuddles, and seeks comfort from attachment figure when they feel the need."
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
                "text": "Uses others as sources of information by asking questions."
              },
              {
                "key": "b",
                "text": "Shows a sense of autonomy through asserting their ideas and preferences and making choices and decisions. Makes choices that involve challenge."
              },
              {
                "key": "c",
                "text": "Identifies self with children of same age and sex. Is developing an understanding of and interest in differences of gender, ethnicity, and ability."
              },
              {
                "key": "d",
                "text": "Feels confident when taken out around the local neighbourhood and enjoys exploring new places with their key person."
              },
              {
                "key": "e",
                "text": "Takes off loose coat or shirt when undone. Removes pull down garments."
              },
              {
                "key": "f",
                "text": "Unzips front zipper on coat or jacket. Can undo Velcro fasteners."
              },
              {
                "key": "g",
                "text": "Clearly communicates wet or soiled nappy or pants, showing increasing awareness of bladder and bowel urges."
              },
              {
                "key": "h",
                "text": "Mostly dry during the day"
              },
              {
                "key": "i",
                "text": "Develops own likes and dislikes in food and drink; willing to try new food textures and tastes."
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
                "text": "More confident in new social situations but may be anxious at first."
              },
              {
                "key": "b",
                "text": "Participates in familiar routines: for example, follows tidy-up routines with adult guidance."
              },
              {
                "key": "c",
                "text": "Recognises self in mirror or photo: for example, if looks in a mirror and sees dirt on face, tries to wipe it off, or points to self in photo when asked."
              },
              {
                "key": "d",
                "text": "Can increasingly express their thoughts and emotions through words as well as continuing to use facial expression."
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
                "text": "Shows independence in selecting and carrying out activities: for example, self-selects toys/materials and uses them in play."
              },
              {
                "key": "b",
                "text": "Enjoys responsibility of carrying out small tasks such as carrying a bag back from the shops."
              },
              {
                "key": "c",
                "text": "Experiments with their own and other people’s views of who they are through their play, through trying out different behaviours and the way they talk about themselves."
              },
              {
                "key": "d",
                "text": "Begins to recognise danger and seeks the support and comfort of significant adults."
              },
              {
                "key": "e",
                "text": "Can tell adults when hungry, full-up, or tired or when they want to rest, sleep, or play."
              },
              {
                "key": "f",
                "text": "Needs to sleep for 10–13 hours in a 24-hour period which may include a nap, with regular sleep and wake-up times."
              },
              {
                "key": "g",
                "text": "Takes pride in appearance: for example, prefers certain clothes."
              },
              {
                "key": "h",
                "text": "Puts arms into open-fronted coat or shirt when held up."
              },
              {
                "key": "i",
                "text": "Can wash and can dry hands effectively and understands why this is important."
              },
              {
                "key": "j",
                "text": "Pulls down own pants when using the toilet."
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
                "text": "Is becoming more aware of the similarities and differences between themselves and others in more detailed ways and identifies themself in relation to social groups and to their peers."
              },
              {
                "key": "b",
                "text": "Has an awareness and pride in self as having own identity and abilities and welcomes praise. Is sensitive to others’ messages of appreciation or criticism."
              },
              {
                "key": "c",
                "text": "Shows their confidence and self-esteem through being outgoing towards people, taking risks, and trying new things or new social situations, and being able to express their needs and ask adults for help."
              },
              {
                "key": "d",
                "text": "Buttons up clothes."
              },
              {
                "key": "e",
                "text": "Gains more bowel and bladder control and can attend to toileting needs most of the time themselves. Reliably dry and clean"
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Can describe self in positive terms and talk about own strengths and weaknesses."
              },
              {
                "key": "b",
                "text": "Has a clear idea about what they want to do in their play and how they want to go about it. Selects and uses activities and resources independently. Shows confidence in choosing resources and perseverance in carrying out a chosen activity."
              },
              {
                "key": "c",
                "text": "Shows confidence in speaking to others about their own needs, wants, interests, and opinions in familiar group"
              },
              {
                "key": "d",
                "text": "Recognises that they belong to different communities and social groups, and communicates freely about own home and community. Is more aware of their relationships to particular social groups and sensitive to prejudice and discrimination."
              },
              {
                "key": "e",
                "text": "Dresses and undresses independently."
              },
              {
                "key": "f",
                "text": "Takes responsibility for self-care in washing, teeth cleaning, and toileting."
              },
              {
                "key": "g",
                "text": "Eats a healthy range of foodstuffs and understands need for variety in food."
              },
              {
                "key": "h",
                "text": "Describes a range of different food textures and tastes when cooking, and notices changes when they are combined or exposed to hot and cold temperatures."
              },
              {
                "key": "i",
                "text": "Describes physical changes to the body that can occur when feeling unwell, anxious, tired, angry, or sad."
              },
              {
                "key": "j",
                "text": "Shows understanding of the need for safety when tackling new challenges, and considers and manages some risks by taking independent action or by giving a verbal warning to others."
              },
              {
                "key": "k",
                "text": "Shows understanding of how to transport and store equipment safely."
              },
              {
                "key": "l",
                "text": "Practices some appropriate safety measures without direct supervision, considering both benefits and risk of a physical experience."
              }
            ]
          }
        ]
      },
      {
        "name": "BUILDING RELATIONSHIPS",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Attention attracted/held if adult uses lively facial expressions and speech (varied tone/volume)."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Makes sounds and movements to initiate interaction with another person."
              },
              {
                "key": "b",
                "text": "Makes own sounds when talked to, especially to parent/carer, and when a smiling face is used."
              },
              {
                "key": "c",
                "text": "Shows their readiness to be social through using their sensory abilities, following movement, and gazing at faces intently: for example, gazes a long time at parent/carer’s face, especially when feeding."
              },
              {
                "key": "d",
                "text": "Usually calms, smiles, or reduces crying when hearing their parents/carers’ voice or smells their clothing."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Holds up arms to be picked up and cuddled, and is soothed by physical touch, such as being held, cuddled, and stroked: for example, calms, snuggles in, smiles, gazes at carer’s face or strokes them."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Takes turns in interactions with others: for example, quietens when other person talks."
              },
              {
                "key": "b",
                "text": "Engage with others through gestures, gaze, and talk: for example, babbles."
              },
              {
                "key": "c",
                "text": "Uses interactions to achieve a goal: for example, gesture towards their cup to say they want a drink."
              },
              {
                "key": "d",
                "text": "Shows awareness of other children: for example, watching, smiling, moving close to them."
              },
              {
                "key": "e",
                "text": "Laughs with favourite people."
              },
              {
                "key": "f",
                "text": "Begins to display attachment behaviours such as wanting to stay near and becoming upset when left with an unfamiliar person."
              },
              {
                "key": "g",
                "text": "Becomes wary of unfamiliar people or people they have not seen for a while."
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
                "text": "Shows interest in the activities of others and responds differently to children and adults: for example, may be more interested in watching children than adults or may pay more attention when children talk to them."
              },
              {
                "key": "b",
                "text": "Points to draw other people’s attention to things of interest."
              },
              {
                "key": "c",
                "text": "Follows with gaze when an adult directs attention to an object by pointing and looking."
              },
              {
                "key": "d",
                "text": "Looks back as they crawl or walk away from their key person."
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
                "text": "Shows interest in the activities of others: for example, watches parent/carer prepare meal; children kicking a ball."
              },
              {
                "key": "b",
                "text": "Draws others into social interaction through calling, crying and babbling, smiling, laughing and moving their bodies and limbs."
              },
              {
                "key": "c",
                "text": "Shares interest and attention by looking to where the adult is looking, pointing and using their gaze to direct the adult’s attention to something."
              },
              {
                "key": "d",
                "text": "Builds relationships with special people. Displays attachment behaviours such as wanting to stay near to their close carers, checking where they are, and protesting when separated."
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
                "text": "Plays alongside other children but remains engaged in their own play."
              },
              {
                "key": "b",
                "text": "Plays happily alone but near familiar adult."
              },
              {
                "key": "c",
                "text": "Plays cooperatively with an adult: for example, may kick or roll the ball back-and-forth."
              },
              {
                "key": "d",
                "text": "Closely watches others’ body language to begin to understand their intentions and meaning."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Is fascinated by other children, watching them and interacting with them through offering toys, food, etc., and by reaching for objects being used by another child."
              },
              {
                "key": "b",
                "text": "Can tolerate brief separations from special people."
              },
              {
                "key": "c",
                "text": "Explores the environment, interacts with others, and plays confidently while their parent/carer or key person is close by; using them as a secure base to return to for reassurance if anxious or in unfamiliar situations."
              },
              {
                "key": "d",
                "text": "Starts to share and ‘exchange’"
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
                "text": "Starts interaction with other children: for example, will often watch, follow and imitate others in their play; begin to cooperate within shared-play activities with other children."
              },
              {
                "key": "b",
                "text": "Hands a toy to an adult for assistance when unable to get it to work: sees adult as someone who can help."
              },
              {
                "key": "c",
                "text": "Responds positively to a variety of familiar carers."
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
                "text": "Takes a lead in positive interactions with special people: for example, initiates interaction; shows spontaneous affection; can wait a little while before seeking others for comfort and security."
              },
              {
                "key": "b",
                "text": "Is curious about others and will modify behaviour to fit in with what others are doing: for example, removing shoes/socks before going on slide after seeing others do this."
              },
              {
                "key": "c",
                "text": "Builds relationships with special people but may show anxiety in the presence of strangers."
              },
              {
                "key": "d",
                "text": "Shows some understanding that other people have perspectives, ideas, and needs that are different to theirs: for example, may turn a book to face you so you can see it."
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
                "text": "Seeks out others to share experiences with and may choose to play with a familiar friend or a child who has similar interest."
              },
              {
                "key": "b",
                "text": "Includes another child in their play sequence and may talk to them as they do so."
              },
              {
                "key": "c",
                "text": "Shows empathy and concern for people who are special to them by partially matching others’ feelings with their own: for example, may offer a child a toy they know they like."
              },
              {
                "key": "d",
                "text": "Likes to sit, have a cuddle, and share events of the day with a familiar adult."
              },
              {
                "key": "e",
                "text": "Gets satisfaction from doing things with other people."
              },
              {
                "key": "f",
                "text": "Notices and ask questions about differences and similarities, such as skin colour, types of hair, gender, special needs, and disabilities."
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
                "text": "Forms a special relationship with another child."
              },
              {
                "key": "b",
                "text": "Seeks out companionship with adults and other children, sharing experiences and play ideas."
              },
              {
                "key": "c",
                "text": "Plays with one or more other children, extending and elaborating play ideas."
              },
              {
                "key": "d",
                "text": "Regularly uses adults as a source of knowledge, comfort, and shared activity."
              },
              {
                "key": "e",
                "text": "Uses their experiences of adult behaviours to guide their social relationships and interactions."
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
                "text": "Enjoys playing alone, alongside, and with others, inviting others to play and attempting to join others’ play."
              },
              {
                "key": "b",
                "text": "In favourable conditions, shows increasing consideration of other people’s needs and gradually exercises more impulse"
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Plays co-operatively as part of a group to act out a narrative."
              },
              {
                "key": "b",
                "text": "Is increasingly flexible and cooperative as they are more able to understand other people’s needs, wants and behaviours."
              },
              {
                "key": "c",
                "text": "Returns to the secure base of a familiar adult to recharge and gain emotional support and practical help in difficult situations."
              },
              {
                "key": "d",
                "text": "Represents and recreates what they have learnt about social interactions from their relationships with close adults, in their play and relationships with others."
              },
              {
                "key": "e",
                "text": "Develops particular friendships with other children, which help them to understand different points of view and to challenge their own and others’ thinking."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "area": "Communication and Language",
    "strands": [
      {
        "name": "LISTENING AND ATTENTION",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Actions/behaviour shows reaction to sounds: for example, startle to loud noises, eyes widen, limbs move or slow, facial twitch, cry, change in sucking patterns during feeding, change in breathing pattern."
              },
              {
                "key": "b",
                "text": "Attention attracted/held if adult uses lively facial expressions and speech (varied tone/volume)."
              },
              {
                "key": "c",
                "text": "Copies facial expressions/mouth shapes: sticking out tongue, widening eyes, open mouth."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Becomes excited in anticipation of play/interaction: for example, waves arm/legs, vocalises."
              },
              {
                "key": "b",
                "text": "Gazes at parent/carer’s face during interactions, especially when feeding or being spoken to."
              },
              {
                "key": "c",
                "text": "Reacts by smiling, looking and moving, and makes sounds in response when parent/carer talks and interacts with them."
              },
              {
                "key": "d",
                "text": "Turns head to parent/carer’s voice or other familiar sounds."
              },
              {
                "key": "e",
                "text": "Shows attention to sounds and music."
              },
              {
                "key": "f",
                "text": "Notices patterns with strong contrasts and appears attracted by patterns resembling the human face."
              },
              {
                "key": "g",
                "text": "Shows excitement at sound of approaching voices or footsteps."
              },
              {
                "key": "h",
                "text": "Quietens or alerts to the sound of speech."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys listening to early interactive nursery rhymes: for example, ‘Round and round the garden’."
              },
              {
                "key": "b",
                "text": "Enjoys singing, music and toys that make sounds: for example, looks towards the sound, or shows pleasure through facial expression or vocalisation."
              },
              {
                "key": "c",
                "text": "Looks towards place where parent/carer is looking."
              },
              {
                "key": "d",
                "text": "Aware of events in their environment: for, example: searches with eyes when hears familiar person enter room."
              },
              {
                "key": "e",
                "text": "Shows interest in moving pictures and sound, such as on a television."
              },
              {
                "key": "f",
                "text": "Looks puzzled or changes behaviour when hearing something new, different or unexpected."
              },
              {
                "key": "g",
                "text": "Listens to parent/carers’ voices even if they can’t see them."
              },
              {
                "key": "h",
                "text": "Is calmed by a familiar and friendly voice."
              },
              {
                "key": "i",
                "text": "Looks intently at person talking but stops responding if speaker turns away."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Anticipates actions, tickles, etc. from sounds and tunes of songs and rhymes: for example, giggles at end of ‘round the garden’ when waiting for a tickle."
              },
              {
                "key": "b",
                "text": "Child has fleeting attention and is easily distracted."
              },
              {
                "key": "c",
                "text": "Turns immediately to familiar voices or familiar sounds across a room."
              },
              {
                "key": "d",
                "text": "Watches and follows adult movements."
              },
              {
                "key": "e",
                "text": "Takes turns in interactions with others: for example, quietens when the other person talks, and may vocalise or make a movement when they pause."
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
                "text": "Can get absorbed in an activity and will ignore distractions."
              },
              {
                "key": "b",
                "text": "Looks at the person speaking."
              },
              {
                "key": "c",
                "text": "Locates the direction sound comes from: for example, looks appropriately in the direction of sound."
              },
              {
                "key": "d",
                "text": "Recognises the voices of key people in their life. E.g. smiles, vocalises"
              },
              {
                "key": "e",
                "text": "Copies what adults do, taking ‘turns’ in conversations (through babbling) and activities. Tries to copy adult speech and lip movements."
              },
              {
                "key": "f",
                "text": "Understands the meaning associated with some environmental sounds: for example, hears phone ring and immediately looks at it."
              },
              {
                "key": "g",
                "text": "Moves whole body to sounds they enjoy: for example, music or a regular beat or being sung to."
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
                "text": "New or dominant stimuli take all of the child’s attention."
              },
              {
                "key": "b",
                "text": "Demonstrates joint attention: for example, attends to an object when parent/carer draws their attention to it by looking and pointing."
              },
              {
                "key": "c",
                "text": "Looks at an object then back to adult to direct adult’s attention to it."
              },
              {
                "key": "d",
                "text": "Concentrates intently on an object or activity of own choosing for short periods."
              },
              {
                "key": "e",
                "text": "Watches and listens to others, copying some behaviours in own play."
              },
              {
                "key": "f",
                "text": "Looks at pictures e.g. in a book pointing to familiar objects, animals and look to adult to label"
              },
              {
                "key": "g",
                "text": "Bounces rhythmically when being sung to or when listening to music."
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
                "text": "Looks at adult to gain attention before pointing."
              },
              {
                "key": "b",
                "text": "Enjoys nursery rhymes and demonstrates listening by trying to join in with actions and/or vocalisation."
              },
              {
                "key": "c",
                "text": "Listens and responds to simple instructions in context: for example, ‘give me the ball’"
              },
              {
                "key": "d",
                "text": "Plays ‘Ready Steady Go’ or ‘1-2-3 go’ games; listening and waiting or sometimes imitating alongside speaker, and shows anticipation in relation to key phrases."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Follows directions if they relate to what they are doing: for example, responds to ‘come and sit here’ when a snack or drink is on the table; goes to get a specific favourite picture book when requested."
              },
              {
                "key": "b",
                "text": "Listens and enjoys rhythmic patterns in rhymes and stories, trying to join in with actions and vocalisations."
              },
              {
                "key": "c",
                "text": "Attends to speech directed to them and listens with interest to general talk."
              },
              {
                "key": "d",
                "text": "Learns to wait for others to finish what they are saying: better at turn-taking and fewer vocal clashes."
              },
              {
                "key": "e",
                "text": "Plays simple co-operative listening games: for example, ‘give it to…’"
              },
              {
                "key": "f",
                "text": "Waits for ‘go’ signal in ‘ready, steady, go’ games."
              },
              {
                "key": "g",
                "text": "Single channel attention. May appear not to hear, but actually needs to ignore external stimuli in order to concentrate."
              },
              {
                "key": "h",
                "text": "Pays attention to own choice of activity, may move quickly from one thing to another."
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
                "text": "Frequently repeats words/signs they hear/see. One or more key word repeated."
              },
              {
                "key": "b",
                "text": "Listens with interest to the noises adults make when they read stories."
              },
              {
                "key": "c",
                "text": "Listens to and carries out simple verbal directions with no or minimal additional visual/gestural prompts."
              },
              {
                "key": "d",
                "text": "Recognises and responds to many familiar sounds: for example, going to the door when they hear a knock."
              },
              {
                "key": "e",
                "text": "Recognises and joins in with songs and actions: for example, ‘Wheels on the bus’."
              },
              {
                "key": "f",
                "text": "Child’s attention can shift to a different task if attention is fully obtained. Saying the child’s name can help them to focus."
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
                "text": "Shows sustained engagement and interactions when sharing a play activity with an adult."
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
                "text": "Concentrates and listens for more than 10 minutes in adult-led activities that they enjoy."
              },
              {
                "key": "b",
                "text": "Is able to follow directions in play, if not intently focused on own choice of activity."
              },
              {
                "key": "c",
                "text": "Notices if adult uses wrong language in familiar stories or rhymes."
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
                "text": "Able to better focus attention. Tend to either listen or do, but can now shift own attention: for example, can alternate full attention between the speaker and the task. Emerging to shift attention without adult support."
              },
              {
                "key": "b",
                "text": "Concentrates and listens for more than 10 minutes in a structured small group activity that they enjoy."
              },
              {
                "key": "c",
                "text": "Fills in the missing words or phrases (speech or sign) in a known rhyme, story retelling or game."
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
                "text": "Listens to others one-to-one or in small groups when conversation interests them."
              },
              {
                "key": "b",
                "text": "Joins in with repeated refrains and anticipates key events and phrases in rhymes and stories."
              },
              {
                "key": "c",
                "text": "Listens to longer stories and can remember much of what happens. E.g. We’re Going on a Bear Hunt"
              },
              {
                "key": "d",
                "text": "Shows variability in listening behaviour; may move around and fiddle but still be listening or sit still but not absorbed by activity."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Understands verbal instruction related to the task without interrupting the task to look at the speaker. Concentration span is short, but group instruction is possible if task appropriate. Two channel attention control. Can listen and do for short span."
              }
            ]
          }
        ]
      },
      {
        "name": "UNDERSTANDING (RECEPTIVE)",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Smiles/quietens to familiar voice/face."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Recognises/most responsive to main carer’s voice: for example, is more vocal/active or offers more eye contact."
              },
              {
                "key": "b",
                "text": "Makes own sounds when talked to, especially to parent/carer and when a smiling face is used."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Responds differently to different tones of your voice (the tone of voice helps the child to understand meaning): for example, sing-song, soothing, questioning, playful."
              },
              {
                "key": "b",
                "text": "Vocalises more when adults use child-directed speech."
              },
              {
                "key": "c",
                "text": "Smiles and becomes animated in response to a familiar person, sometimes making sounds."
              },
              {
                "key": "d",
                "text": "Vocalises back when talked to, making own sounds, especially to familiar adult and when a smiling face is used."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Recognises and responds to own name: for example, turns or looks up in response to name."
              },
              {
                "key": "b",
                "text": "Recognises some familiar names: for example, Mummy, Daddy, names of siblings. E.g. will turn and look"
              },
              {
                "key": "c",
                "text": "Understands familiar words they hear like ‘all gone’ or ‘bye-bye’ by responding with the appropriate action"
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
                "text": "Shows understanding of familiar objects by actions: for example, pretends to drink from an empty cup."
              },
              {
                "key": "b",
                "text": "Initiates simple turn-taking by offering objects."
              },
              {
                "key": "c",
                "text": "Responds to simple familiar language in context: for example, child moves/looks to door when parent/carer holds up keys and says ‘time to go’. (At this stage, the child is mainly responding to tone of voice and situational cues in a particular, well known routine.)"
              },
              {
                "key": "d",
                "text": "Understands name of some common objects: for example, picks up or points to a toy when it is named/signed."
              },
              {
                "key": "e",
                "text": "Waves ‘bye-bye’ when asked."
              },
              {
                "key": "f",
                "text": "Responds to familiar words/signs in play: for example, looks to find ball in response to ‘Where’s the ball?’"
              },
              {
                "key": "g",
                "text": "Recognises some family names such as Mummy, Daddy, names of siblings or family pets and will turn to look when the name is said/signed."
              },
              {
                "key": "h",
                "text": "Responds appropriately to words and interactive rhymes: for example, joins in with ‘clap hands’."
              },
              {
                "key": "i",
                "text": "Enjoys finding their nose, eyes or tummy as part of a naming game, with adult prompts."
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
                "text": "Shows understanding of at least 15 words/signs used in reference to the immediate context: for example, looks, points to, or finds an object when asked, such as in response to ‘Where’s your shoes?’"
              },
              {
                "key": "b",
                "text": "Points to named/signed items in picture book."
              },
              {
                "key": "c",
                "text": "Can choose between two presented objects: “Do you want the ball or the car?” By reaching out/pointing"
              },
              {
                "key": "d",
                "text": "Simple communication takes place between an adult and the child mainly focusing on the here and now."
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
                "text": "Demonstrates increasing understanding of vocabulary at a one-word level: understands 1-2 new words/signs each week."
              },
              {
                "key": "b",
                "text": "Follows simple instructions, particularly if accompanied by gestures and/or signs: for example, pointing to things or people."
              },
              {
                "key": "c",
                "text": "Identifies simple body parts on self and others: for example, hair, eyes, ears, nose."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Recognises and will identify many objects and pictures when named/signed."
              },
              {
                "key": "b",
                "text": "Picks out two or more objects from a group of four: for example, ‘Give me the cup and the doll.’"
              },
              {
                "key": "c",
                "text": "Understands familiar action words: for example, ‘sit down’, ‘come here’, ‘stop that’."
              },
              {
                "key": "d",
                "text": "Follows routine events and activities, using non-verbal cues: for example, follows group to bathroom or sits down for story."
              },
              {
                "key": "e",
                "text": "Follow directions during play: for example, ‘feed teddy’."
              },
              {
                "key": "f",
                "text": "Understands and follows simple stories read to them."
              },
              {
                "key": "g",
                "text": "Demonstrates increasing understanding of vocabulary at a two-word level: for example, understands simple instructions involving a person and an object, such as ‘Get Mummy’s shoes’, ‘Where is your coat?’"
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
                "text": "Selects familiar objects by name and will go and find objects when asked, or identify objects from a group."
              },
              {
                "key": "b",
                "text": "Understands ‘who’, ‘what’, ‘where’ in simple questions within the context of an activity: for example, when looking at a family photo album, the child names people when asked ‘Who can you see?’"
              },
              {
                "key": "c",
                "text": "Understands simple questions about objects: for example, when presented with the real object or simple picture can respond correctly to questions such as ‘What do we drink out of?’; ‘Which one says “woof woof”?’ through pointing."
              },
              {
                "key": "d",
                "text": "Understands approximately 50 words/signs."
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
                "text": "Responds appropriately to simple two-part instructions or requests within an immediate context: for example, ‘Get your shoes and put on your coat’, ‘Pick up the ball and give it to Mummy’."
              },
              {
                "key": "b",
                "text": "Identifies action words by pointing to the right picture: for example, ‘Who’s jumping?’"
              },
              {
                "key": "c",
                "text": "Will point to smaller parts of the body when asked to do so: for example, chin, elbow, eyebrow."
              },
              {
                "key": "d",
                "text": "Understands at a two-word level concepts using real objects and situations: for example, size (big, little, etc.); prepositions (in, on, under); first/last or now/then. E.g. First wash hands then sit at table"
              },
              {
                "key": "e",
                "text": "Understands simple questions about objects: for example, when presented with the real object or simple picture can respond correctly to questions such as ‘What do we drink out of?’; ‘Which one says “woof woof”?’ by saying the correct word."
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
                "text": "Retells a simple past event in correct order: for example, ‘went down slide, hurt finger’."
              },
              {
                "key": "b",
                "text": "Understands use of objects: for example, ‘What do we use to cut things with?’; ‘Which one barks?’"
              },
              {
                "key": "c",
                "text": "Understands at a three-word level concepts using real objects and situations: for example, ‘Teddy on the table’."
              },
              {
                "key": "d",
                "text": "Can identify picture of object at a three-word level: for example, ‘Girl eating banana’, ‘Dog drinking water’, ‘cat drinking milk’"
              },
              {
                "key": "e",
                "text": "Understands objects by description: for example, ‘The wet one’, ‘The dirty one’."
              },
              {
                "key": "f",
                "text": "Understands all pronouns: for example, ‘they’, ‘he’, ‘she’, ‘him’, ‘her’."
              },
              {
                "key": "g",
                "text": "Provides appropriate information in response to ‘what’ and ‘where’ questions."
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
                "text": "Can give information about own life and favourite things."
              },
              {
                "key": "b",
                "text": "Answers questions more fully, providing more than one piece of information."
              },
              {
                "key": "c",
                "text": "Shows understanding of prepositions ‘on top’, ‘behind’ and ‘next to’ by carrying out action."
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
                "text": "Uses language to connect ideas, explain what is happening, and anticipate what might happen next in a familiar situation."
              },
              {
                "key": "b",
                "text": "Understands ‘why’, ‘when’ and ‘how’ questions."
              },
              {
                "key": "c",
                "text": "Compare sizes, weights, etc. using gesture and language: ‘bigger/little/smaller’, ‘high/low’, ‘tall’, ‘heavy’."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Understands humour: for example, nonsense rhymes, jokes."
              },
              {
                "key": "b",
                "text": "Listens and responds to ideas expressed by others in conversation or discussion."
              },
              {
                "key": "c",
                "text": "Understands a range of complex sentence structures, including negatives, plurals, and tenses."
              }
            ]
          }
        ]
      },
      {
        "name": "SPEAKING (EXPRESSIVE)",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Cries to express needs: for example, when hungry or in discomfort."
              },
              {
                "key": "b",
                "text": "Stops crying when picked up."
              },
              {
                "key": "c",
                "text": "Makes sounds such as gurgles and coos."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Responds when talked to by a familiar adult: for example, moves arms/legs/body, changes facial expression, moves mouth, makes sounds."
              },
              {
                "key": "b",
                "text": "Uses different sounds/cries to show hunger, tiredness, pain."
              },
              {
                "key": "c",
                "text": "Communicates needs and feelings in a variety of ways including crying, gurgling, babbling, and squealing."
              },
              {
                "key": "d",
                "text": "Produces and copies non-speech sounds: for example, coos, raspberries, effort grunts, shrieks, squeals."
              },
              {
                "key": "e",
                "text": "Gurgles to get attention."
              },
              {
                "key": "f",
                "text": "Smiles at non-moving object or picture."
              },
              {
                "key": "g",
                "text": "Smiles at another person."
              },
              {
                "key": "h",
                "text": "Smiles more often to familiar rather than unfamiliar people."
              },
              {
                "key": "i",
                "text": "Laughs to express pleasure."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": []
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Uses voice or gesture to: attract attention, for example, by holding up objects, waving arms; ask for things, for example, reaching, opening and shutting hands, hands raised to indicate ‘up’."
              },
              {
                "key": "b",
                "text": "Uses voice, gesture or actions to join in with a familiar rhyme or game."
              },
              {
                "key": "c",
                "text": "Waves bye-bye through copying: for example, copies others when they wave to them."
              },
              {
                "key": "d",
                "text": "Communicates friendliness or annoyance through vocalisation."
              },
              {
                "key": "e",
                "text": "Voice starts to have the tone and rhythm (intonation patterns and stresses of familiar phrases) of the language spoken at home (the first language)."
              },
              {
                "key": "f",
                "text": "Vocal babble is increasingly speech-like, containing consonant and vowel sounds: for example, ‘baba’, ‘gaga’."
              },
              {
                "key": "g",
                "text": "Copy what adults do, taking ‘turns’ in conversations (through babbling) and activities. Try to copy adult speech and lip movements: for example, putting lips together for /m/, or rounding lips for /oo/."
              },
              {
                "key": "h",
                "text": "Begins to use varied double syllable sounds. For example: ‘dadi’, ‘babu’, or uses a variety of syllables in continued babbling, such as ‘badago’ (variegated babble)."
              },
              {
                "key": "i",
                "text": "Consistently uses simple sounds or gesture to mean a particular thing: for example, ‘da’ for daddy."
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
                "text": "Begins to point to objects, self, and others close by, using index finger to make a request or share an interest."
              },
              {
                "key": "b",
                "text": "Uses gesture and/or voice to respond."
              },
              {
                "key": "c",
                "text": "Uses gesture and/or voice to direct attention to objects and people as well as self."
              },
              {
                "key": "d",
                "text": "Makes it clear through gesture and/or voice when they want something to happen again: for example, to play a game again or when wanting more to eat."
              },
              {
                "key": "e",
                "text": "Copies gestures as part of games and familiar routines: for example, clapping hands, waving ‘bye’, blowing kisses, open hands for ‘where is it’ or ‘all gone’."
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
                "text": "Points to objects in the environment to direct adult attention and share interest. May vocalise or make eye contact when pointing."
              },
              {
                "key": "b",
                "text": "Points to or reaches towards desired objects to request them. May vocalise or make eye contact when doing this."
              },
              {
                "key": "c",
                "text": "Imitates signs/spoken words and sounds."
              },
              {
                "key": "d",
                "text": "Asks for games using words/signs/gesture: for example, says ‘boo’ or hides face in hands for peek-a-boo."
              },
              {
                "key": "e",
                "text": "Creates personal words as they begin to develop language."
              },
              {
                "key": "f",
                "text": "Communicates to name favourite items: for example, ‘bubbles’, ‘ball’, ‘cat’."
              },
              {
                "key": "g",
                "text": "Communicates to make requests: for example, ‘drink’, ‘more’."
              },
              {
                "key": "h",
                "text": "Waves ‘bye-bye’ spontaneously."
              },
              {
                "key": "i",
                "text": "Babbles freely when alone or playing and increasingly experiments with sounds."
              },
              {
                "key": "j",
                "text": "Uses a wide range of consonant and vowel sounds in babble/jargon. (/p/ /h/ /d/ /b/ (stops) are the most common sounds used in first words, such as ‘bibi’ for biscuit.)"
              },
              {
                "key": "k",
                "text": "Voice starts to have the tone and rhythm (patterns and stresses of familiar phrases) of the language spoken at home even though individual words may not be clear."
              },
              {
                "key": "l",
                "text": "Uses different sounds instead of words to represent different objects: for example, ‘brmm’ for car."
              },
              {
                "key": "m",
                "text": "Can imitate sounds and/or gestures that are not part of their repertoire: for example, watches an adult carefully and then imitates something they have not done before."
              },
              {
                "key": "n",
                "text": "Uses approximately five single words without prompting."
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
                "text": "Beginning to develop expressive language at a one-word level: for example, uses at least 10 words."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Copies and uses voice spontaneously as part of games/familiar routines: for example, ‘bye-bye’, ‘all gone’."
              },
              {
                "key": "b",
                "text": "Joins in very familiar nursery rhymes and action songs: for example, by vocalising key words or sounds and/or using own versions of actions or approximations to actions linked to the rhyme."
              },
              {
                "key": "c",
                "text": "Uses a mixture of words/vocalisations to accompany play."
              },
              {
                "key": "d",
                "text": "Uses up to 20 words. Names things and people within familiar environments; comments on what’s happening; responds to adult’s questions or comments; protests; expresses likes and dislikes; describes actions."
              },
              {
                "key": "e",
                "text": "Names pictures of common objects when pointed to."
              },
              {
                "key": "f",
                "text": "Joins in simple narrative by answering questions about things that are very familiar: for example, answers ‘shoes’ when asked ‘What goes on your feet?’ or fills in gap, such as ‘lets put on your…’ (child fills in ‘shoes’)."
              },
              {
                "key": "g",
                "text": "Beginning to develop expressive language at a two-word level by joining two words/signs: for example, ‘Daddy gone’."
              },
              {
                "key": "h",
                "text": "Continues to use simplified versions of words: for example, ‘goggy’ for dog."
              },
              {
                "key": "i",
                "text": "Imitates words by reproducing some speech sounds and the correct number of syllables."
              },
              {
                "key": "j",
                "text": "Talks to self continuously when playing, though this may not be readily understood by others."
              },
              {
                "key": "k",
                "text": "Produces several words recognisable to family members."
              },
              {
                "key": "l",
                "text": "Begins to use words/signs to refer to people and things that are not present."
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
                "text": "Rapid growth in expressive vocabulary: at least 50 words."
              },
              {
                "key": "b",
                "text": "Points to and names simple pictures."
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
                "text": "Uses words during play and almost all activities, and to ask and find out about things."
              },
              {
                "key": "b",
                "text": "Answers simple questions: for example, ‘Where’s Mum?’"
              },
              {
                "key": "c",
                "text": "Uses a variety of simple questions: ‘what?’, ‘where?’, ‘who?’"
              },
              {
                "key": "d",
                "text": "Uses several pronouns correctly: ‘I’, ‘me’, ‘you’."
              },
              {
                "key": "e",
                "text": "Uses 10-15 actions words/signs: for example, ‘eat’, ‘drink’, ‘sleep’, ‘wash’, ‘play’, ‘finish’."
              },
              {
                "key": "f",
                "text": "Uses words to describe things: for example, ‘It’s wet’, ‘It’s too hot’."
              },
              {
                "key": "g",
                "text": "Uses over 200 words."
              },
              {
                "key": "h",
                "text": "Uses appropriate intonation to ask questions."
              },
              {
                "key": "i",
                "text": "Has a sing-song quality to speech that adds to expression/meaning."
              },
              {
                "key": "j",
                "text": "Familiar adults understand speech when words are joined into sentences."
              },
              {
                "key": "k",
                "text": "Learns new words very rapidly and is able to use them when communicating with other people."
              }
            ]
          },
          {
            "number": 11,
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
                "text": "Beginning to develop expressive language at a four-word level."
              },
              {
                "key": "b",
                "text": "Retells a simple familiar story recalling the correct sequence."
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
                "text": "Easily understood by a range of people: for example, uses intonation, rhythm and phrasing to make meaning clear."
              },
              {
                "key": "b",
                "text": "Begins to use language for pretending and organising: for example, ‘You be the mum and I be the baby.’"
              },
              {
                "key": "c",
                "text": "Uses talk to connect ideas, explain what is happening and anticipate what might happen next, recall and relive past experiences: for example, using ‘and’ and ‘because’ to link ideas."
              },
              {
                "key": "d",
                "text": "Beginning to use a range of tenses but continues to make errors in language: for example, ‘runned’ instead of ‘ran’"
              },
              {
                "key": "e",
                "text": "Using talk in pretending that objects stand for something else in play: for example, ‘This box is my castle.’"
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": []
          }
        ]
      }
    ]
  },
  {
    "area": "Physical Development",
    "strands": [
      {
        "name": "GROSS MOTOR SKILLS",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Makes smooth movements with arms and legs, which gradually become more controlled."
              },
              {
                "key": "b",
                "text": "Presses down foot/straightens body when held standing on a hard surface."
              },
              {
                "key": "c",
                "text": "Lifts head clear of ground."
              },
              {
                "key": "d",
                "text": "Can lift head while on tummy and move it from side to side, gradually developing ability to hold own head up for longer."
              },
              {
                "key": "e",
                "text": "Turns head to side when placed on tummy."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Able to control head when supported in an upright position; head does not flop forwards or backwards."
              },
              {
                "key": "b",
                "text": "When lying on tummy, lifts head up and uses forearms to support."
              },
              {
                "key": "c",
                "text": "Rolls over from back to side, gradually spending longer on side, waving upper leg before returning to back."
              },
              {
                "key": "d",
                "text": "Sits with support (such as, cushions) and when held in adult’s hands."
              },
              {
                "key": "e",
                "text": "When lying on tummy becomes able to lift first head and then chest, supporting self with forearms."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "When lying on back, plays with hands and grasps feet, alternating mouthing hands/feet, with focused gaze on them."
              },
              {
                "key": "b",
                "text": "Develops roll from back through to front, gradually becoming happy to spend longer on tummy, as able to lift head for longer."
              },
              {
                "key": "c",
                "text": "When lying on tummy can lift head and chest, and support self with straight arms and flat hands."
              },
              {
                "key": "d",
                "text": "When supported in sitting can turn head from side to side."
              },
              {
                "key": "e",
                "text": "When in supported sitting can pass objects from one hand to another."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "When sitting can lean forward to pick up small toys."
              },
              {
                "key": "b",
                "text": "Stretches out with one hand to grasp offered toy."
              },
              {
                "key": "c",
                "text": "Sits unsupported on the floor, leaving hands free to manipulate objects with both hands."
              },
              {
                "key": "d",
                "text": "Pulls to standing from crawling, holding on to furniture or person for support."
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
                "text": "Can reach and grasp a moving object by moving towards where the object will go."
              },
              {
                "key": "b",
                "text": "Picks up larger objects: for example, teddy or a ball."
              },
              {
                "key": "c",
                "text": "Throws and/or drops toys deliberately."
              },
              {
                "key": "d",
                "text": "Begins to crawl in different ways and directions: crawls, bottom shuffles, or rolls continuously to move around."
              },
              {
                "key": "e",
                "text": "Kneels up to furniture."
              },
              {
                "key": "f",
                "text": "Becomes adept at changing position from crawling to sitting in order to stop, pick up, handle, and investigate objects"
              },
              {
                "key": "g",
                "text": "Starts to throw and release objects overarm."
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
                "text": "Pulls self to standing against furniture and can lower self-back again."
              },
              {
                "key": "b",
                "text": "Walks around furniture lifting one foot and stepping sideways (cruising)."
              },
              {
                "key": "c",
                "text": "Walks with one or two hands held by adult."
              },
              {
                "key": "d",
                "text": "Takes first few steps: feet wide apart, uneven steps, arms raised for balance."
              },
              {
                "key": "e",
                "text": "Fits themself into spaces, such as tunnels, dens, and large boxes, and moves around in them."
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
                "text": "Walks with shorter steps and legs closer together; no longer needs to hold arms up for balance."
              },
              {
                "key": "b",
                "text": "Walks up steps holding hand of adult."
              },
              {
                "key": "c",
                "text": "Comes downstairs backwards on knees (crawling) or slides on bottom."
              },
              {
                "key": "d",
                "text": "Starts walking independently on firm surfaces and later on uneven surfaces."
              },
              {
                "key": "e",
                "text": "Pushes, pulls, lifts, and carries objects, moving them around and placing them with intent."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Runs without bumping into obstacles."
              },
              {
                "key": "b",
                "text": "Sits on small tricycle, moving it with feet pushing against the floor."
              },
              {
                "key": "c",
                "text": "Can kick a large ball."
              },
              {
                "key": "d",
                "text": "Gets onto child’s chair without assistance, either backwards or sideways."
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
                "text": "Runs safely on whole foot, stopping and starting easily."
              },
              {
                "key": "b",
                "text": "Squats steadily to rest or play with object on the ground and rises to feet without using hands."
              },
              {
                "key": "c",
                "text": "Walks upstairs facing forwards holding rail or hand of adult, with both feet onto a step at a time."
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
                "text": "Pushes and pulls large toys, such as prams, but has difficulty steering around obstacles."
              },
              {
                "key": "b",
                "text": "Climbs play climbing equipment with confidence and increasing skill."
              },
              {
                "key": "c",
                "text": "Begins to walk, run, and climb on different levels and surfaces."
              },
              {
                "key": "d",
                "text": "Walks upstairs independently using bannister rail or wall for support."
              },
              {
                "key": "e",
                "text": "Can walk considerable distances with purpose."
              },
              {
                "key": "f",
                "text": "Sits confidently on a chair with both feet on the ground."
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
                "text": "Kicks a stationary ball with either foot with increasing force and accuracy."
              },
              {
                "key": "b",
                "text": "Rides tricycle using pedals."
              },
              {
                "key": "c",
                "text": "Climbs up and downstairs by placing both feet on each step while holding handrail for support."
              },
              {
                "key": "d",
                "text": "Walks downstairs safely, two feet to each step while carrying a toy."
              },
              {
                "key": "e",
                "text": "Can balance on one foot or in a squat momentarily, shifting body weight to improve stability."
              },
              {
                "key": "f",
                "text": "Spins self, rolls, and independently use ropes and swings."
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
                "text": "Jumps into the air with both feet leaving the floor and can jump forward a small distance."
              },
              {
                "key": "b",
                "text": "Walks downstairs or slopes whilst carrying a small object, maintaining balance and stability."
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
                "text": "Runs with spatial awareness and negotiates space successfully, adjusting speed or direction to avoid obstacles."
              },
              {
                "key": "b",
                "text": "Can grasp and release with two hands to throw and catch a large ball, beanbag or an object."
              },
              {
                "key": "c",
                "text": "Climbs stairs and steps (using alternate feet, one step at a time), and moves across climbing equipment, maintaining balance using hands and body to stabilise."
              },
              {
                "key": "d",
                "text": "Uses large-muscle movements to wave flags and streamers, paint and make marks."
              },
              {
                "key": "e",
                "text": "Jumps off an object and lands appropriately using hands, arms, and body to stabilise and balance."
              },
              {
                "key": "f",
                "text": "Chooses to move in a range of ways, moving freely and with confidence, making changes to body shape, position, and pace of movement: for example, slithering, shuffling, rolling, crawling, walking, running, jumping, skipping, sliding, and hopping."
              },
              {
                "key": "g",
                "text": "Experiments with different ways of moving, testing out ideas and adapting movements to reduce risk: for example, decides if they will crawl, walk, or run across a plank depending on its width/length."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Shows increasing control over an object in pushing, patting, throwing, catching, or kicking it."
              },
              {
                "key": "b",
                "text": "Travels around, under, over, and through balancing and climbing equipment with confidence."
              },
              {
                "key": "c",
                "text": "Progress towards a more fluent style of moving with developing control and grace: for example, rolling, crawling, walking, jumping, running, hopping, skipping, and climbing."
              },
              {
                "key": "d",
                "text": "Uses their core muscle strength to achieve a good posture when sitting at a table or sitting on the floor."
              },
              {
                "key": "e",
                "text": "Confidently and safely uses a range of large and small apparatus indoors and outside, alone and in a group."
              },
              {
                "key": "f",
                "text": "Develops confidence, competence, and accuracy when engaging in activities that involve a ball, including throwing, catching, kicking, passing, batting and aiming."
              }
            ]
          }
        ]
      },
      {
        "name": "FINE MOTOR SKILLS",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Closes hand firmly around object placed in palm."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Explores hands and fingers: for example, watches them, presses hands together, clasps and unclasp hands."
              },
              {
                "key": "b",
                "text": "Uses movement and senses to focus on, reach for, and grasp objects."
              },
              {
                "key": "c",
                "text": "Repeats actions that have an effect: for example, kicking or batting a mobile to create movement."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Explores objects with mouth, often picking up an object and holding it to mouth for lips and tongue to explore (mouthing)."
              },
              {
                "key": "b",
                "text": "Persistently and deliberately reaches out for objects."
              },
              {
                "key": "c",
                "text": "Uses whole hand to hold an object (palmar grasp)."
              },
              {
                "key": "d",
                "text": "Follows and tracks a sound or moving object, moving head and eyes."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Passes toys from one hand to the other."
              },
              {
                "key": "b",
                "text": "Can release an object from their grasp on a hard surface."
              },
              {
                "key": "c",
                "text": "Can place the object down deliberately."
              },
              {
                "key": "d",
                "text": "Looks at and pokes small objects with index finger."
              },
              {
                "key": "e",
                "text": "Watches toy or object as it falls down."
              },
              {
                "key": "f",
                "text": "Eyes now move together to look at people or objects. Watches and follows people or objects around."
              },
              {
                "key": "g",
                "text": "Releases objects and hands them to another person or drops them."
              },
              {
                "key": "h",
                "text": "Picks up things between thumb and fingers with an immature pincer grasp."
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
                "text": "Holds objects in both hands and bring them together in the middle."
              },
              {
                "key": "b",
                "text": "Uses index finger to point at objects, sharing attention with adult."
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
                "text": "Builds a tower of 2 blocks."
              },
              {
                "key": "b",
                "text": "Turns over container to tip out contents."
              },
              {
                "key": "c",
                "text": "Picks up objects in palmar grasp and shakes, waves, bangs, pulls, and tugs them in between two hands, and looks at them."
              },
              {
                "key": "d",
                "text": "Holds pen or crayon using a whole hand (palmar) grasp and scribbles with different strokes."
              },
              {
                "key": "e",
                "text": "Enjoys finger and toe rhymes and games."
              },
              {
                "key": "f",
                "text": "Manipulates objects using hands singly and together: for example, squeezing water out of a sponge."
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
                "text": "Builds a tower of 3 or more blocks."
              },
              {
                "key": "b",
                "text": "Fits round shape into puzzle or posting box."
              },
              {
                "key": "c",
                "text": "Turns knobs and removes easy screw lids."
              },
              {
                "key": "d",
                "text": "Watches small moving toy/object at 3m or more away."
              },
              {
                "key": "e",
                "text": "Beginning to show hand preference (not established)."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Builds a tower of 6 blocks."
              },
              {
                "key": "b",
                "text": "Threads large beads onto firm cord, stick, or pipe cleaner."
              },
              {
                "key": "c",
                "text": "Holds pen or pencil in the middle using thumb and fingers."
              },
              {
                "key": "d",
                "text": "Uses whole arm when markmaking."
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
                "text": "Fits smaller shapes and objects into holes during posting activities."
              },
              {
                "key": "b",
                "text": "Threads large beads onto floppier cords: for example, washing line/shoelace."
              },
              {
                "key": "c",
                "text": "Scans pages and looks at books studying each picture for details."
              },
              {
                "key": "d",
                "text": "Turns pages in a book, sometimes several at once."
              },
              {
                "key": "e",
                "text": "Places objects down neatly and precisely."
              },
              {
                "key": "f",
                "text": "Holds a pencil in a developing tripod grip between thumb and two fingers; no longer using whole hand."
              },
              {
                "key": "g",
                "text": "Picks up tiny objects accurately and quickly using pincer grip."
              },
              {
                "key": "h",
                "text": "Produces lines that intersect; beginning to make cross and grid-like patterns."
              },
              {
                "key": "i",
                "text": "Scribble writes, including ‘V’ shape and vertical lines."
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
                "text": "Builds a tower of more than 7 blocks."
              },
              {
                "key": "b",
                "text": "Fits small shapes and objects into holes during posting activities."
              },
              {
                "key": "c",
                "text": "Screws and unscrews jar lids, nuts and bolts, etc."
              },
              {
                "key": "d",
                "text": "Fits round, square, and triangle shapes into a puzzle and posting box."
              },
              {
                "key": "e",
                "text": "Shows increasing control in holding, using, and manipulating a range of tools and objects, such as tambourines, jugs, hammers, and mark making tools."
              },
              {
                "key": "f",
                "text": "Draws a simple face: for example, circle for the head with dots/dashes/lines for eyes, nose, and mouth."
              }
            ]
          },
          {
            "number": 11,
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
                "text": "Manipulates a range of tools and equipment in one hand: for example, paintbrushes, scissors, hairbrushes, toothbrush, etc."
              },
              {
                "key": "b",
                "text": "Shows a preference for dominant hand: note which one, if any."
              },
              {
                "key": "c",
                "text": "Creates lines and circles pivoting from the shoulder and elbow."
              },
              {
                "key": "d",
                "text": "Begins to use anti-clockwise movement and retrace vertical lines to create letters and numbers: for example, m, o, a, 6, 9."
              },
              {
                "key": "e",
                "text": "Makes diagonal patterns."
              },
              {
                "key": "f",
                "text": "Starts to make recognisable ‘S’ and ‘8’ type shapes."
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
                "text": "Uses simple tools to effect changes to materials."
              },
              {
                "key": "b",
                "text": "Handles tools, objects, construction, and malleable materials safely and with increasing control and intention."
              },
              {
                "key": "c",
                "text": "Begins to form recognisable letters independently."
              },
              {
                "key": "d",
                "text": "Lessening of arm movement and greater use of hand/wrist movement to write."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Uses a pencil and holds it effectively to form recognisable letters, most of which are formed correctly."
              },
              {
                "key": "b",
                "text": "Uses ideas involving fitting, overlapping, in, out, enclosure, grids, and sun-like shapes."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "area": "Literacy",
    "strands": [
      {
        "name": "COMPREHENSION",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Can move eyes to look at different parts of objects and pictures."
              },
              {
                "key": "b",
                "text": "Looks at pictures and moving objects for more than 5 seconds."
              },
              {
                "key": "c",
                "text": "Interested in new experiences: for example, shows renewed interest if you present a different toy or book."
              },
              {
                "key": "d",
                "text": "Notices and engages with sounds and images in the environment."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Looks from one object to another and back again: ‘shifting visual attention’. Objects may be moving or still."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys songs and rhymes, tuning in and paying attention: for example, ‘Round and round the garden’."
              },
              {
                "key": "b",
                "text": "Plays with and explores objects/pictures by touching them."
              },
              {
                "key": "c",
                "text": "Plays with and explores objects/pictures by looking at them."
              },
              {
                "key": "d",
                "text": "Plays with and explores objects/books by placing them in their mouth and/or smelling them."
              },
              {
                "key": "e",
                "text": "Plays with and explores objects by listening to sounds made."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Mouths books, turns over several pages at once; stops momentarily at page that catches eye."
              },
              {
                "key": "b",
                "text": "Enjoys looking at books and other printed or digital materials with familiar people and being read to."
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
                "text": "Follows with gaze when an adult directs attention to an object/picture by looking and pointing."
              },
              {
                "key": "b",
                "text": "Begins to point to objects, pictures, and people using index finger."
              },
              {
                "key": "c",
                "text": "Looks at pictures in books with interest without needing adult input."
              },
              {
                "key": "d",
                "text": "Responds to sounds in the environment such as cars, sirens, and birds."
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
                "text": "Enjoys listening to the same story over and over again."
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
                "text": "Enjoys nursery rhymes and demonstrates listening by trying to join in with actions and vocalisations. They may say some of the words in familiar songs and rhymes."
              },
              {
                "key": "b",
                "text": "Identifies many objects and pictures by pointing when asked questions: for example, ‘Where’s the ball?’"
              },
              {
                "key": "c",
                "text": "Interested in books and rhymes and may have favourites."
              },
              {
                "key": "d",
                "text": "Understands and follows simple and familiar stories read to them."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Joins in with actions and sounds in familiar songs and rhymes; words/signs becoming clearer."
              },
              {
                "key": "b",
                "text": "Shows sustained interest in looking at pictures and books with adult."
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
                "text": "Turns pages in a book, sometimes several at once."
              },
              {
                "key": "b",
                "text": "Scans pages and looks at books, studying each picture for details."
              },
              {
                "key": "c",
                "text": "Has favourite books and seeks them out to share with an adult, another child, or to look at alone."
              },
              {
                "key": "d",
                "text": "Repeats words and phrases from familiar stories: for example, Dear Zoo."
              },
              {
                "key": "e",
                "text": "Fills in the missing word or phrase in a known rhyme, story or game: for example, ‘Humpty Dumpty sat on a…’"
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
                "text": "Shows sustained interest in picture books."
              },
              {
                "key": "b",
                "text": "Shares books with adult or other child, making ‘comments’ about the events and pictures."
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
                "text": "Holds books the correct way up and turns pages one at a time."
              },
              {
                "key": "b",
                "text": "Joins in with simple repeated refrains and phrases in rhymes and stories: for example, in ‘That’s not my…’ books."
              },
              {
                "key": "c",
                "text": "Shows interest in illustrations, print in books, and print in the environment."
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
                "text": "Takes part in ‘reading’ by filling in words and phrases."
              },
              {
                "key": "b",
                "text": "Listens to and joins in with stories and poems when reading and sharing a story with an adult or in a small group."
              },
              {
                "key": "c",
                "text": "Anticipates key events and repeated phrases in stories and rhymes."
              },
              {
                "key": "d",
                "text": "Begins to be aware of the way stories are structured, and to tell their own stories."
              },
              {
                "key": "e",
                "text": "Shows interest in illustrations and words in print and digital books and words in the environment."
              },
              {
                "key": "f",
                "text": "Shows an interest in numerals in the environment."
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
                "text": "Looks at and enjoys print and digital books independently."
              },
              {
                "key": "b",
                "text": "Knows information can be relayed in the form of print, signs, and symbols in various forms: for example, printed materials, digital screens, and environmental print."
              },
              {
                "key": "c",
                "text": "Listens to stories with increasing attention and recall."
              },
              {
                "key": "d",
                "text": "Shows an understanding of some elements of stories: for example, main character, sequence of events, and story beginnings and endings."
              },
              {
                "key": "e",
                "text": "Retells stories in the correct sequence, drawing on language patterns of stories, such as ‘Once upon a time’."
              },
              {
                "key": "f",
                "text": "Can identify/name the different parts of a book: for example, front cover, title, author, contents page, etc."
              },
              {
                "key": "g",
                "text": "Begins to navigate apps and websites on digital media, using icons to select apps and drop-down menus to select websites."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Engages in extended conversations about stories: for example, discusses main story settings, events, and principal characters, and may be able to suggest how story will end."
              },
              {
                "key": "b",
                "text": "Uses vocabulary and forms of speech that are increasingly influenced by their experiences of books."
              },
              {
                "key": "c",
                "text": "Enjoys an increasing range of print and digital books, both fiction and non-fiction."
              },
              {
                "key": "d",
                "text": "In their play re-enacts and reinvents stories they have heard."
              },
              {
                "key": "e",
                "text": "Engages with books and other reading materials at an increasingly deeper level, sometimes drawing on their phonic knowledge to decode words, and their knowledge of language structure, subject knowledge and illustrations to interpret text."
              }
            ]
          }
        ]
      },
      {
        "name": "WORD READING",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": []
          },
          {
            "number": 9,
            "ageRange": "21-25 months",
            "title": "Step 9 (21-25 months)",
            "items": [
              {
                "key": "a",
                "text": "Sings songs and says rhymes, independently: for example, singing whilst playing."
              },
              {
                "key": "b",
                "text": "Repeats words and phrases from familiar stories: for example, Dear Zoo."
              },
              {
                "key": "c",
                "text": "Fills in the missing word or phrase in a known rhyme, story or game: for example, ‘Humpty Dumpty sat on a…’"
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
                "text": "Shares books with adult or other child, making ‘comments’ about the events and pictures."
              }
            ]
          },
          {
            "number": 11,
            "ageRange": "30-36months",
            "title": "Step 11 (30-36months)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys rhyming and rhythmic activities: for example, Silly Soup."
              },
              {
                "key": "b",
                "text": "Joins in with simple repeated refrains and phrases in rhymes and stories: for example, in ‘That’s not my…’ books."
              },
              {
                "key": "c",
                "text": "Shows interest in illustrations, print in books, and print in the environment: for example, the first letter of their name, a bus or door number, or a familiar logo/app."
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
                "text": "Takes part in ‘reading’ by filling in words and phrases."
              },
              {
                "key": "b",
                "text": "Shows awareness of rhyme and alliteration: for example, can pick out words that rhyme and continues a rhyming string."
              },
              {
                "key": "c",
                "text": "Recognises rhythm in spoken words: for example, count or clap syllables in a word."
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
                "text": "Recognise words with the same initial sound: for example, the phoneme /d/ is the initial consonant sound in daddy and dog."
              },
              {
                "key": "b",
                "text": "Knows that print carries meaning and, in English, is read from left to right and top to bottom."
              },
              {
                "key": "c",
                "text": "Knows information can be relayed in the form of print, signs, and symbols in various forms: for example, printed materials, digital screens, and environmental print."
              },
              {
                "key": "d",
                "text": "Recognises familiar words and signs such as own name and advertising logos."
              },
              {
                "key": "e",
                "text": "Makes attempts at reading familiar words in picture books."
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
                "text": "Can segment sounds (phonemes) in simple words and blend them together and knows which letters (graphemes) represent some of them: for example, when reading aloud the word ‘cat’, sounds out the phonemes /c/ /a/ /t/ and knows that these sounds can be written down as the graphemes ‘c’ ‘a’ ‘t’."
              },
              {
                "key": "b",
                "text": "Blends sounds (phonemes) into words so they can read short words made up of known letter-sound correspondences (GPCs): for example, fluently sounds out the blends in the word ‘stop’, ‘tree’, etc."
              },
              {
                "key": "c",
                "text": "Reads simple phrases and sentences made up of words with known letter-sound correspondences and a few exception words (words containing unusual GPCs), such as ‘go’, ‘he’, ‘is’, etc."
              },
              {
                "key": "d",
                "text": "Can read-out words that rhyme and continues a rhyming string: for example, ‘cat’, ‘mat’, ‘hat’, ‘sat’, etc."
              },
              {
                "key": "e",
                "text": "Reads some letter groups that each represent one sound and say sounds for them: for example, reads the following graphemes ’th’, ‘sh’, ‘ch’, ‘ee’, ‘igh’, etc. and says the corresponding sound, or phoneme (GPC)."
              },
              {
                "key": "f",
                "text": "Reads a few common exception words matched to school’s phonic programme: for example, ‘said’, ‘were’, ‘do’."
              }
            ]
          }
        ]
      },
      {
        "name": "WRITING",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Makes movements with arms and legs, which gradually become more controlled."
              },
              {
                "key": "b",
                "text": "Looks steadily at things for short periods (5 seconds or more)."
              },
              {
                "key": "c",
                "text": "Closes hand firmly around object placed in palm."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Explores hands and fingers: for example, watches them, presses hands together, clasps and unclasp hands."
              },
              {
                "key": "b",
                "text": "Uses movement and senses to focus on, reach for, and grasp objects."
              },
              {
                "key": "c",
                "text": "Repeats actions that have an effect: for example, kicking or batting a mobile to create movement."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Persistently and deliberately reaches out for objects."
              },
              {
                "key": "b",
                "text": "Uses whole hand to hold objects (palmar grasp)."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Discovers mark making: for example, noticing that trailing a finger through spilt juice changes it."
              },
              {
                "key": "b",
                "text": "Picks up things between thumb and fingers with an immature pincer grasp."
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
                "text": "Holds pen or crayon using a palmar grasp and spontaneously makes scribble marks."
              },
              {
                "key": "b",
                "text": "Picks up small objects easily between thumb and index finger using a pincer grasp."
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
                "text": "Holds pen or crayon using whole hand (palmar) grasp and scribbles with different strokes."
              },
              {
                "key": "b",
                "text": "Enjoys the sensory experience of making marks in food, damp sand, water, mud, paste or paint."
              },
              {
                "key": "c",
                "text": "Begins to understand the cause and effect of their actions in mark making."
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
                "text": "Explores and experiments with a range of media: for example, paint, dough, paper, music-making objects, etc."
              },
              {
                "key": "b",
                "text": "Beginning to show hand preference (not established)."
              },
              {
                "key": "c",
                "text": "Scribbles spontaneously and makes strokes and dots on paper, enjoying the sensory feeling of making marks."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Holds pen or pencil in the middle using thumb and fingers."
              },
              {
                "key": "b",
                "text": "Uses whole arm when mark making."
              },
              {
                "key": "c",
                "text": "When holding crayons, chalks, etc., makes connections between their movements and the marks they make: draws vertical lines; produces circular scribble; produces side-to-side and to-and–fro scribble."
              },
              {
                "key": "d",
                "text": "Knows that the marks they make are of value."
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
                "text": "Holds a pencil in a developing tripod grip between thumb and two fingers; no longer using whole hand."
              },
              {
                "key": "b",
                "text": "Produces lines that intersect, Emerging to make cross- and grid-like patterns."
              },
              {
                "key": "c",
                "text": "Scribble writes, including ‘V’ shape and vertical lines."
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
                "text": "Enjoys drawing and writing on paper and different textures, such as sand or playdough, and using touch-screen technology."
              },
              {
                "key": "b",
                "text": "Creates and experiments with symbols and marks."
              },
              {
                "key": "c",
                "text": "Draws simple recognisable shapes: for example, tree, sun."
              },
              {
                "key": "d",
                "text": "Imitates simple shapes: for example, circle, square."
              },
              {
                "key": "e",
                "text": "Imitates a simple face: for example, circle for the head with dots/dashes/lines for eyes, nose, and mouth."
              },
              {
                "key": "f",
                "text": "Sometimes give meanings to their drawings and paintings."
              },
              {
                "key": "g",
                "text": "Adds some marks to their drawings to which they give meaning: for example, ‘That says Mummy.”"
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
                "text": "Holds pencil near its tip between first 2 fingers and thumb and uses it with good control to draw."
              },
              {
                "key": "b",
                "text": "Draws spontaneous and recognisable forms: for example, a circle for a head with one or two other features/parts."
              },
              {
                "key": "c",
                "text": "Starts to copy some simple horizontal and vertical letters and numbers: for example, E, F, H, T, L and 1, 7, 4."
              },
              {
                "key": "d",
                "text": "Explores using a range of their own marks and signs to which they ascribe mathematical meaning."
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
                "text": "Understands they can use lines to enclose a space and then begins to use these shapes to represent objects."
              },
              {
                "key": "b",
                "text": "Begins to use anti-clockwise movement and retrace vertical lines to create letters and numbers: for example, m, o, a, 6, 9."
              },
              {
                "key": "c",
                "text": "Makes diagonal lines and patterns: for example, making X-type marks and patterns using a variety of media/materials."
              },
              {
                "key": "d",
                "text": "Starts to make recognisable ‘S’ and ‘8’ type shapes."
              },
              {
                "key": "e",
                "text": "Can copy some letters of the alphabet, usually from own name."
              },
              {
                "key": "f",
                "text": "Makes up stories, play scenarios, and drawings in response to experiences, such as outings."
              },
              {
                "key": "g",
                "text": "Includes mark making and early writing in their play."
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
                "text": "Writes some letters accurately."
              },
              {
                "key": "b",
                "text": "Writes some or all of their name."
              },
              {
                "key": "c",
                "text": "Ascribes meaning to marks that they see in different places."
              },
              {
                "key": "d",
                "text": "Gives meaning to marks they make as they draw, write and paint."
              },
              {
                "key": "e",
                "text": "Attempts to write own name, or other names and words, using combinations of lines, circles and curves, or letter-type shapes; words not necessarily recognisable."
              },
              {
                "key": "f",
                "text": "Lessening of arm movement and greater use of hand/wrist movement to write."
              },
              {
                "key": "g",
                "text": "Shows interest in letters on a keyboard, identifying the initial letter of their own name and other familiar words."
              },
              {
                "key": "h",
                "text": "Begins to make letter-type shapes to represent the initial sound of their name and other familiar words: for example, writing a pretend shopping list that starts at the top of the page with a ‘m’ for milk."
              },
              {
                "key": "i",
                "text": "Starts to develop phonic knowledge by linking sounds to letters, naming and sounding some of the letters of the alphabet, identifying letters, and writing recognisable letters in sequence, such as in their own name."
              },
              {
                "key": "j",
                "text": "Experiments with their own symbols and marks as well as numerals."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Uses their developing phonic knowledge to write things such as labels and captions, later progressing to simple sentences."
              },
              {
                "key": "b",
                "text": "Copy writes short sentence from adult model."
              },
              {
                "key": "c",
                "text": "Uses a pencil and holds it effectively to form recognisable letters (lower- and upper-case); most correctly formed."
              },
              {
                "key": "d",
                "text": "Produces detailed drawings using a combination of forms such as fitting in, overlapping, in and out of enclosures, grids, and sun-like shapes to portray their ideas."
              },
              {
                "key": "e",
                "text": "Writes short sentences with known sound-letter correspondence using a capital letter and full stop."
              },
              {
                "key": "f",
                "text": "Enjoys creating texts to communicate meaning for an increasing range of purposes such as greeting cards, tickets, lists, invitations and creating their own stories and books, sometimes with words, in print and digital formats."
              },
              {
                "key": "g",
                "text": "Begins to break the flow of speech into words, to hear and say the initial sound in words, and may start to segment the sounds into words and blend them together."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "area": "Mathematics",
    "strands": [
      {
        "name": "NUMBER",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Shows interest in new experiences: for example, when you show a new toy."
              },
              {
                "key": "b",
                "text": "Moves hanging rattle or soft toy while moving arms or legs."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Uses movement and senses to focus on, reach for, and grasp objects."
              },
              {
                "key": "b",
                "text": "Can shift visual attention by looking from one object to another and back again."
              },
              {
                "key": "c",
                "text": "Shows anticipation and enjoyment of familiar caring routines: for example, sucks/licks lips in response to sounds of preparation for feeding; waves arms or vocalises in excitement when undressed for bath."
              },
              {
                "key": "d",
                "text": "Developing an awareness of their own bodies: that their body has different parts and their relationship to each other."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Persistently and deliberately reaches out for toys."
              },
              {
                "key": "b",
                "text": "Explores space when they are free to move, roll, and stretch."
              },
              {
                "key": "c",
                "text": "Plays with and explores objects by banging and shaking, touching them, looking at them, placing them in their mouth, and listening to the sounds they make."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Looks for objects they have just dropped. Looks towards the floor when object is dropped by others."
              },
              {
                "key": "b",
                "text": "Watches toy being partially hidden under a cloth/container then finds it."
              },
              {
                "key": "c",
                "text": "Can still be surprised by things disappearing then reappearing suddenly: for example, pop up toys."
              },
              {
                "key": "d",
                "text": "Anticipates movement of object/person: for example, if ball rolls behind couch, looks to other side expecting it to reappear."
              },
              {
                "key": "e",
                "text": "Begins to use cause and effect: for example, will repeat actions in order to repeat the effects."
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
                "text": "Explores new objects systematically: for example, first banging, then mouthing, then turning over. (This helps understanding and awareness of cause and effect.)"
              },
              {
                "key": "b",
                "text": "Enjoys putting object in and out of containers."
              },
              {
                "key": "c",
                "text": "Watches toy being hidden under a cloth and finds it immediately: showing awareness of object permanence."
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
                "text": "May be aware of number names through their enjoyment of action rhymes and songs that relate to numbers."
              },
              {
                "key": "b",
                "text": "Demonstrates persistent search for objects, even when hidden under 2-3 covers."
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
                "text": "Says some counting words randomly."
              },
              {
                "key": "b",
                "text": "With adult support able to demonstrate 1:1 correspondence: for example, making sounds and pointing."
              },
              {
                "key": "c",
                "text": "Enjoys ‘ready steady go’ and 1, 2, 3 go’ games."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Can tell the difference between quantities, recognising that a group of objects is more than one object."
              },
              {
                "key": "b",
                "text": "Reacts to changes of amount in a group of up to three items: for example, shows renewed interest in the objects when more items are added to the original presentation."
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
                "text": "Begins to use number words like ‘one’ or ‘two’, and sometimes responds accurately when asked to give one or two things."
              },
              {
                "key": "b",
                "text": "Tries to work out problems by thinking first: for example, how to switch something on."
              },
              {
                "key": "c",
                "text": "Carries out simple everyday sequences: for example, pouring cereal into bowl and adding milk with adult support."
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
                "text": "Develops counting-like behaviour, such as making sounds, pointing, or saying some numbers in sequence."
              },
              {
                "key": "b",
                "text": "Begins to say numbers in order, some of which are in the right order (ordinality)."
              },
              {
                "key": "c",
                "text": "Has some understanding of 1 and 2 in practical situations: for example, says ‘I have two boats.’"
              },
              {
                "key": "d",
                "text": "Uses some number language in play to compare quantity (such as, ‘all gone’, ‘more’, ‘lots’, or ‘same’): for example, ‘milk all"
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
                "text": "Explores using a range of their own marks and signs to which they ascribe mathematical meanings."
              },
              {
                "key": "b",
                "text": "Beginning to count on their fingers."
              },
              {
                "key": "c",
                "text": "In everyday situations, takes or gives two or three objects from a group."
              },
              {
                "key": "d",
                "text": "Compares two small groups of up to five objects, saying when there are the same number of objects in each group: for example, ‘You’ve got two, I’ve got two. Same!’"
              },
              {
                "key": "e",
                "text": "Uses some number names and language spontaneously in play; however, not consistent or accurate: for example, counts in everyday contexts, sometimes skipping numbers ‘one, two, three, five.’"
              },
              {
                "key": "f",
                "text": "Beginning to notice numerals (number symbols): for example, notices a number of significance (such as their age) printed in books or displayed in the environment."
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
                "text": "Recites numbers in order to 10."
              },
              {
                "key": "b",
                "text": "Enjoys counting verbally as far as they can go."
              },
              {
                "key": "c",
                "text": "Beginning to recognise that each counting number is one more than the one before."
              },
              {
                "key": "d",
                "text": "Points or touches (tags) each item, saying one number for each item, using the stable order of 1,2,3,4,5."
              },
              {
                "key": "e",
                "text": "Counts up to five items, recognising that the last number said represents the total counted so far (cardinal principle)."
              },
              {
                "key": "f",
                "text": "Shows ‘finger numbers’ up to 5."
              },
              {
                "key": "g",
                "text": "Realises not only objects, but anything can be counted, including steps, claps, or jumps."
              },
              {
                "key": "h",
                "text": "Begins to recognise numerals 0 to 10. Shows an interest in numerals in the environment."
              },
              {
                "key": "i",
                "text": "Uses some number names and number language accurately within play, and may show fascination with large numbers."
              },
              {
                "key": "j",
                "text": "Subitises one, two, and three objects (recognising the quantity within a group without counting)."
              },
              {
                "key": "k",
                "text": "Through play and exploration, Beginning to learn that numbers are made up (composed) of smaller numbers: for example, recognises that three train carriages and two more train carriages make five carriages in total."
              },
              {
                "key": "l",
                "text": "Beginning to use understanding of number to solve practical problems in play and meaningful activities: for example, there are 3 people having milk, so we need to get 3 cups."
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
                "text": "Engages in subitising numbers to four and maybe five."
              },
              {
                "key": "b",
                "text": "Recognises numerals 1 to 5. Links numerals with amounts up to 5 and maybe beyond."
              },
              {
                "key": "c",
                "text": "Compares two quantities using language such as ‘more than’, ‘fewer than’: for example, a child comments ‘Lottie has 2 more cars than me’."
              },
              {
                "key": "d",
                "text": "Solves real world mathematical problems with numbers up to 5: for example, has 3 bricks but need 5, so they find two more."
              },
              {
                "key": "e",
                "text": "Finds one more or less than a number from one to ten."
              },
              {
                "key": "f",
                "text": "Experiments with their own symbols and marks as well as numerals."
              },
              {
                "key": "g",
                "text": "Separates a group of three or four objects in different ways, beginning to recognise that the total is still the same."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Enjoys reciting numbers from 0 to 10 (and beyond) and back from 10 to 0."
              },
              {
                "key": "b",
                "text": "Counts out up to 10 objects from a larger group."
              },
              {
                "key": "c",
                "text": "Matches the numeral with a group of items to show how many there are (up to 10)."
              },
              {
                "key": "d",
                "text": "Finds the total number of items in two groups by counting all of them."
              },
              {
                "key": "e",
                "text": "Shares objects into equal groups and counts how many in each group."
              },
              {
                "key": "f",
                "text": "Explores the composition of numbers to 10."
              },
              {
                "key": "g",
                "text": "Automatically recalls number bonds for numbers 0-10."
              },
              {
                "key": "h",
                "text": "Increasingly confident at putting numerals in order 0 to 10 (ordinality)."
              },
              {
                "key": "i",
                "text": "Uses number names and symbols when comparing numbers, showing interest in large numbers."
              },
              {
                "key": "j",
                "text": "Estimates numbers of things, showing understanding of relative size."
              },
              {
                "key": "k",
                "text": "Shows awareness that numbers are made up (composed) of smaller numbers, exploring partitioning in different ways with a wide range of objects."
              },
              {
                "key": "l",
                "text": "Begins to conceptually subitise larger numbers by subitising smaller groups within the number: for example, sees six raisins on a plate as three and three."
              },
              {
                "key": "m",
                "text": "Begins to explore and work out mathematical problems, using signs and strategies of their own choice, including (when appropriate) standard numerals, tallies, and ‘+’ or ‘-‘ signs."
              }
            ]
          }
        ]
      },
      {
        "name": "NUMERICAL PATTERNS",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": []
          },
          {
            "number": 5,
            "ageRange": "9-13 months",
            "title": "Step 5 (9-13 months)",
            "items": [
              {
                "key": "a",
                "text": "Looks in the right place for toys that fall out of sight: demonstrates awareness of object permanence. Awareness"
              },
              {
                "key": "b",
                "text": "Explores new objects systematically: for example, first banging, then mouthing, then turning over."
              },
              {
                "key": "c",
                "text": "Removes pieces from inset puzzles and large pegs from pegboard. Shape"
              },
              {
                "key": "d",
                "text": "Responds to changes of shape: for example, watching a balloon inflate and deflate."
              },
              {
                "key": "e",
                "text": "Puts objects inside others and take them out again."
              },
              {
                "key": "f",
                "text": "Explores differently sized and shaped objects. Measure"
              },
              {
                "key": "g",
                "text": "Responds to size, reacting to very big or very small items that they see or try to pick up."
              },
              {
                "key": "h",
                "text": "Shows interest in patterned songs and rhymes, perhaps with repeated actions."
              },
              {
                "key": "i",
                "text": "Shows interest in pattern objects and images: for example, reaching out to touch stripes on a play mat."
              },
              {
                "key": "j",
                "text": "Begins to predict what happens next in predictable situations: for example, anticipates food when sat in highchair."
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
                "text": "Intensely curious: exploring objects, rooms, outside areas, or, if not mobile, shows curiosity by pointing or Spatial looking at areas/objects they would like to explore."
              },
              {
                "key": "b",
                "text": "Demonstrates persistent search for objects, even when hidden under 2-3 covers."
              },
              {
                "key": "c",
                "text": "Emerging to put objects of similar shapes inside others and take them out again."
              },
              {
                "key": "d",
                "text": "Shows an interest in emptying containers."
              },
              {
                "key": "e",
                "text": "Joins in with repeated actions in songs and stories. Pattern"
              },
              {
                "key": "f",
                "text": "Initiates and continues repeated actions: for example, bangs tambourine and looks for the adult to continue."
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
                "text": "Finds toy when hidden under one of two/three identical covers laid out in a row, using visual memory to find Spatial the right cover."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Beginning to select a shape for a specific space: for example, looks at shape of piece and shapes on a puzzle board and fits together correctly."
              },
              {
                "key": "b",
                "text": "Can organise and categorise objects: for example, putting all red things and all blue things in separate piles, or all teddies in one box and all cars in another."
              },
              {
                "key": "c",
                "text": "Uses blocks to create their own simple structures and arrangements."
              },
              {
                "key": "d",
                "text": "Uses experience to predict simple cause and effect: for example, straightens tower of blocks if it wobbles. Pattern"
              },
              {
                "key": "e",
                "text": "Anticipates what might happen next because of what other people say/sign."
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
                "text": "Tries to work out problems by thinking first: for example, how to get something out of reach. Awareness"
              },
              {
                "key": "b",
                "text": "Self-corrects during an activity without adult prompting: for example, tries to fit a puzzle piece in the wrong Shape space then changes to the right space."
              },
              {
                "key": "c",
                "text": "Matches sets of identical objects in practical situations: developing understanding of concept of ‘the same’."
              },
              {
                "key": "d",
                "text": "Explores capacity by selecting, filling, and emptying containers: for example, fitting toys in a pram."
              },
              {
                "key": "e",
                "text": "Becoming familiar with patterns in daily routines: for example, ‘it’s snack time now and outdoor play next’."
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
                "text": "Moves their body and toys around objects and explores fitting into spaces. Awareness"
              },
              {
                "key": "b",
                "text": "Completes a simple 2-4-piece puzzle with shapes that fit together."
              },
              {
                "key": "c",
                "text": "Matches simple pictures of familiar objects."
              },
              {
                "key": "d",
                "text": "Matches objects to picture: for example, matches real shoe to a picture of a shoe."
              },
              {
                "key": "e",
                "text": "Matches simple shapes: circle, square, triangle."
              },
              {
                "key": "f",
                "text": "Notices simple patterns and shapes in pictures."
              },
              {
                "key": "g",
                "text": "Explores differences in size, length, weight, and capacity."
              },
              {
                "key": "h",
                "text": "Fits 3-4 nesting/stacking cups together independently, showing understanding of size differences and fit."
              },
              {
                "key": "i",
                "text": "Understands size differences: for example, selects the big or small object when asked."
              },
              {
                "key": "j",
                "text": "Begins to use the language of size and weight."
              },
              {
                "key": "k",
                "text": "Demonstrates some understanding of simple math vocabulary in play activities: for example, big/little, in, on, under, full/empty, long/short, more, now/next, first/last."
              },
              {
                "key": "l",
                "text": "Understands some talk about immediate past and future (‘before’, ‘later’, ‘soon’): for example, ‘Shoes on before you play outside.’"
              },
              {
                "key": "m",
                "text": "Anticipates specific time-based events, such as mealtimes or home time. Pattern"
              },
              {
                "key": "n",
                "text": "Names two or three colours."
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
                "text": "Begins to remember their way around familiar environments."
              },
              {
                "key": "b",
                "text": "Responds to some spatial and positional language."
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
                "text": "Responds to and uses language of position and direction. Spatial"
              },
              {
                "key": "b",
                "text": "Predicts, moves, and rotates objects to fit the space or create the shape they would like. Awareness"
              },
              {
                "key": "c",
                "text": "Shows understanding of prepositions ‘on top’, ‘behind’ and ‘next to’ by carrying out action."
              },
              {
                "key": "d",
                "text": "Can describe the shapes of objects: for example, round and tall."
              },
              {
                "key": "e",
                "text": "Shows interest in shape by sustained construction activity or by talking about shapes or arrangements."
              },
              {
                "key": "f",
                "text": "Responds to both informal language (such as, pointy, twisty, wiggly, bumpy) and common shape names."
              },
              {
                "key": "g",
                "text": "Beginning to talk about the shapes of everyday objects."
              },
              {
                "key": "h",
                "text": "Selects a particular named shape."
              },
              {
                "key": "i",
                "text": "Chooses items based on their shape which are appropriate for the child’s purpose."
              },
              {
                "key": "j",
                "text": "Shows awareness of shape similarities and differences between objects."
              },
              {
                "key": "k",
                "text": "Enjoys partitioning shapes to make new 2D and 3D shapes: for example, cuts sandwich into squares/ triangles."
              },
              {
                "key": "l",
                "text": "Talks about and identifies the patterns around them: for example, stripes on clothes, designs on rugs, etc. Pattern"
              },
              {
                "key": "m",
                "text": "Uses informal language like ‘spotty’, ‘blobs’, ‘pointy’, etc."
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
                "text": "Understands position through words alone, without pointing: for example, ‘Put the pig in front of the farmer.’"
              },
              {
                "key": "b",
                "text": "Uses spatial language to describe position and give directions: for example, ‘above’, ‘beside’, ‘behind’, etc."
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
                "text": "Investigates turning and flipping objects in order to make shapes fit and creates models: predicting and Spatial visualising how they will look (spatial reasoning)."
              },
              {
                "key": "b",
                "text": "Enjoys making simple maps of familiar and imaginative environments, with landmarks."
              },
              {
                "key": "c",
                "text": "Talks about and explores 2D and 3D shapes (for example, circles, rectangles, triangles and cuboids) using informal and mathematical language: ‘sides’, ‘corners’; ‘straight’, ‘flat’, ‘round’."
              },
              {
                "key": "d",
                "text": "Enjoys composing and decomposing shapes, learning which shapes combine to make other shapes."
              },
              {
                "key": "e",
                "text": "Uses own ideas to make models of increasing complexity, selecting blocks needed, solving problems and visualising what they will build."
              },
              {
                "key": "f",
                "text": "Beginning to experience measuring time with timers and calendars."
              },
              {
                "key": "g",
                "text": "Uses language such as ‘greater’, ‘smaller’, ‘heavier’ or ‘lighter’ to compare more than two quantities."
              },
              {
                "key": "h",
                "text": "Enjoys tackling problems involving prediction and engages in discussions involving comparisons by length, weight, or capacity, paying attention to fair-testing and accuracy: for example, in considering how many Measure buckets of water it will take to fill a wheelbarrow, recognises we need to make sure the bucket is full to the same level when counting them."
              },
              {
                "key": "i",
                "text": "Becomes familiar with measuring tools in everyday experiences and play."
              },
              {
                "key": "j",
                "text": "Increasingly able to order and sequence events using language related to time: both past and present."
              },
              {
                "key": "k",
                "text": "Notices and corrects an error in a repeating pattern."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "area": "Understanding the World",
    "strands": [
      {
        "name": "PAST AND PRESENT",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": []
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "Cooperates in everyday routines: for example, dressing, bathing, singing games, tidying up."
              },
              {
                "key": "b",
                "text": "Enjoys teasing games: for example, ‘I’m going to get you’ or tickling games, etc."
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
                "text": "Imitates some everyday routines: for example, washing clothes, sweeping floor."
              },
              {
                "key": "b",
                "text": "Enjoys anticipation games/toys: for example, jack-in-the-box, ready-steady-go."
              },
              {
                "key": "c",
                "text": "Joins in simple routines spontaneously."
              },
              {
                "key": "d",
                "text": "Remembers where objects belong."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Anticipates what might happen next because of what other people say/sign."
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
                "text": "Able to imitate actions in play a while after they have seen them demonstrated."
              },
              {
                "key": "b",
                "text": "Recognises and anticipates everyday routines: for example, looks at coat when adult is getting ready to go out."
              },
              {
                "key": "c",
                "text": "Is curious about people and shows interest in stories about people, animals, or objects that they are familiar with or which fascinate them."
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
                "text": "Understands simple explanations and reasons given by others: for example, ‘We can go to the park after lunch.’"
              },
              {
                "key": "b",
                "text": "Understands some talk about immediate past and future (‘before’, ‘later’, ‘soon’): for example, ‘Shoes on before you play outside.’"
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
                "text": "Can perform new actions a while after they have seen them demonstrated by a more able partner (imitation)."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35-41 months",
            "title": "Step 12 (35-41 months)",
            "items": []
          },
          {
            "number": 13,
            "ageRange": "40-50 months",
            "title": "Step 13 (40-50 months)",
            "items": [
              {
                "key": "a",
                "text": "Recognises and describes special times or events for family or friends."
              },
              {
                "key": "b",
                "text": "Talks about personal intentions, describing what they are trying to do."
              },
              {
                "key": "c",
                "text": "Begins to make sense of their own life-story and family’s history."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Explains own knowledge and understanding and asks appropriate questions of others."
              },
              {
                "key": "b",
                "text": "Makes short term future-plans: for example, says ‘Tomorrow I’m going to…’; ‘Next week it’s my birthday.’"
              },
              {
                "key": "c",
                "text": "Compares and contrasts characters from stories, including figures from the past."
              },
              {
                "key": "d",
                "text": "Comments on images of familiar situations in the past."
              },
              {
                "key": "e",
                "text": "Talks about past and present events in their own life and in the lives of family members."
              }
            ]
          }
        ]
      },
      {
        "name": "PEOPLE, CULTURE AND COMMUNITIES",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": []
          },
          {
            "number": 6,
            "ageRange": "12-16 months",
            "title": "Step 6 (12-16 months)",
            "items": [
              {
                "key": "a",
                "text": "Copies actions and activities of others, including use of gesture or voice, as part of their play."
              },
              {
                "key": "b",
                "text": "Cooperates in everyday routines: for example, dressing, bathing, singing games, tidying up."
              },
              {
                "key": "c",
                "text": "Demonstrates early pretend behaviour: for example, pretends to be asleep by covering self with blanket."
              },
              {
                "key": "d",
                "text": "Engages in simple pretend play with soft toys: for example, hugs and kisses teddy."
              },
              {
                "key": "e",
                "text": "Uses real object for pretend play on self or another: for example, drinks from a cup, brushes someone’s hair."
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
                "text": "Copies things they see and hear others doing around them, including phrases, parts of games, and actions: for example, joining in with action songs and rhymes at carpet time."
              },
              {
                "key": "b",
                "text": "Imitates some everyday routines: for example, washing clothes, sweeping floor."
              },
              {
                "key": "c",
                "text": "Is curious about people and shows interest in stories about themselves and their family."
              },
              {
                "key": "d",
                "text": "Plays cooperatively with an adult: for example, kicks or rolls ball back and forth."
              },
              {
                "key": "e",
                "text": "Joins in simple routines spontaneously: for example, wipes face after dinner."
              },
              {
                "key": "f",
                "text": "Hands a toy to adult for assistance when unable to get it to work."
              },
              {
                "key": "g",
                "text": "Includes other people and objects in pretend play: for example, feeds a doll or teddy with a spoon or cup."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Imitates everyday actions in pretend play: for example, brushing doll’s hair, making beds, tasting food, cleaning dolls house, getting in the car, shopping, etc."
              },
              {
                "key": "b",
                "text": "Recognises familiar adult in picture."
              },
              {
                "key": "c",
                "text": "Recognises self in mirror or photograph."
              },
              {
                "key": "d",
                "text": "Will pause and wait with support for turn in play with others."
              },
              {
                "key": "e",
                "text": "Spends time within groups of other children engaged in own play but watching the other children."
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
                "text": "Imitates longer sequences in play: for example, pours tea, pours in milk and sugar, stirs, and then gives to doll."
              },
              {
                "key": "b",
                "text": "Displays curiosity by asking questions using words/signs, and looking intently at objects, events and people."
              },
              {
                "key": "c",
                "text": "Enjoys dressing up: for example, puts on hats; looks at self in mirror when putting on dressing-up clothes."
              },
              {
                "key": "d",
                "text": "Enjoys being part of activities with adult or older child, often involving running or chasing."
              },
              {
                "key": "e",
                "text": "Is curious about people and shows interest in stories about people, animals, or objects that they are familiar with or which fascinate them."
              },
              {
                "key": "f",
                "text": "Is interested in photographs of themselves and other familiar people and objects."
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
                "text": "Has a sense of own immediate family and relations, including pets."
              },
              {
                "key": "b",
                "text": "Beginning to have their own friends."
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
                "text": "In pretend play imitates everyday actions and events from own family and cultural background: for example, making chapatis, drinking tea, going to the barbers, being a cat, dog, or bird."
              },
              {
                "key": "b",
                "text": "Notices and is curious about differences between people."
              },
              {
                "key": "c",
                "text": "Joins in with learning activities led by more able partners and can perform new actions after they have seen them demonstrated."
              },
              {
                "key": "d",
                "text": "Enjoys playing with small world reconstructions, building on first-hand experiences: for example, visiting farms, garages, train tracks, walking by river or lake."
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
                "text": "Notices what adults do: copying what is observed and then doing it when the adult is not there."
              },
              {
                "key": "b",
                "text": "Shows interest in the lives of people who are familiar to them."
              },
              {
                "key": "c",
                "text": "Shows interest in different occupations and ways of life."
              },
              {
                "key": "d",
                "text": "Enjoys joining in with family customs and routines."
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
                "text": "Recognises and describes special times or events for family or friends."
              },
              {
                "key": "b",
                "text": "Knows some of the things that make them unique, and can talk about some of the similarities and differences in relation to friends or family."
              },
              {
                "key": "c",
                "text": "Continues developing positive attitudes about the differences between people."
              },
              {
                "key": "d",
                "text": "Begins to understand there are different countries in the world and talks about the differences they have experienced or seen."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Explains own knowledge and understanding of the world around them and asks appropriate questions."
              },
              {
                "key": "b",
                "text": "Recognise some similarities and differences between life in this country and life in other countries."
              }
            ]
          }
        ]
      },
      {
        "name": "THE NATURAL WORLD",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": [
              {
                "key": "a",
                "text": "Responds to touch ‘games’ (stroking tummy/feet, tickling, kissing, blowing on tummy) by stilling, smiling, gazing, or waving arms/legs, etc."
              },
              {
                "key": "b",
                "text": "Closes hand firmly around objects placed in palm."
              },
              {
                "key": "c",
                "text": "Turns head/eyes towards diffuse light or interesting objects."
              },
              {
                "key": "d",
                "text": "Can move eyes to look at different parts of objects and pictures."
              },
              {
                "key": "e",
                "text": "When lying on back or propped up moves eyes to follow close face/object moving slowly from side-to-side."
              },
              {
                "key": "f",
                "text": "Turns eyes and/or head towards new sounds."
              },
              {
                "key": "g",
                "text": "Is startled by sudden noise."
              },
              {
                "key": "h",
                "text": "Interested in new experiences: for example, shows renewed interest if you present a different toy."
              }
            ]
          },
          {
            "number": 2,
            "ageRange": "2-5 months",
            "title": "Step 2 (2-5 months)",
            "items": [
              {
                "key": "a",
                "text": "Repeats actions that have an effect: for example, kicking or batting mobile to create movement."
              },
              {
                "key": "b",
                "text": "Brings objects to mouth to explore them."
              },
              {
                "key": "c",
                "text": "Likes listening to music, rattles, and other sound-making toys."
              },
              {
                "key": "d",
                "text": "Reacts with abrupt behaviour change when a face or object disappears suddenly from view."
              }
            ]
          },
          {
            "number": 3,
            "ageRange": "4-7 months",
            "title": "Step 3 (4-7 months)",
            "items": [
              {
                "key": "a",
                "text": "Plays with and explores objects by touching them, looking at them, mouthing them, and listening to the sounds they make."
              },
              {
                "key": "b",
                "text": "Repeats action to make sound again: for example, shakes rattle, squeezes toy, kicks at baby gym."
              },
              {
                "key": "c",
                "text": "Persistently and deliberately reaches out for toys that interest them."
              },
              {
                "key": "d",
                "text": "Recognises familiar environmental sounds (washing machine, microwave, footsteps); shown by quietening/consistent reactions/turning to looks at source of sound."
              },
              {
                "key": "e",
                "text": "Notices changes in objects, pictures and sounds: for example, may look puzzled or stop what they are doing when bubbles pop and disappear or music stops."
              }
            ]
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Actively explores objects using all senses: shaking, looking, feeling, tasting, mouthing, pulling, turning, poking."
              },
              {
                "key": "b",
                "text": "Begins to understand cause and effect: for example, will deliberately repeat actions in order to repeat the effect."
              },
              {
                "key": "c",
                "text": "Looks towards the floor when object is dropped by themselves or others."
              },
              {
                "key": "d",
                "text": "Watches own hand movements intently, for 5 seconds +."
              },
              {
                "key": "e",
                "text": "Watches toy being partially hidden under a cloth/container and then finds it."
              },
              {
                "key": "f",
                "text": "Anticipates movement of object/person: for example, if ball rolls behind couch looks to other side expecting it to reappear."
              },
              {
                "key": "g",
                "text": "Stares with increasing interest when a new object is shown to them."
              },
              {
                "key": "h",
                "text": "Can still be surprised by things disappearing then reappearing suddenly: for example, pop-up toys."
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
                "text": "Explores new objects systematically: for example, first banging, then mouthing, then turning over. (This helps understanding and awareness of cause and effect.)"
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
                "text": "Knows there are different ways to play with different toys: for example, a ball is for rolling/throwing, a car is for pushing, blocks are for building/posting, etc."
              },
              {
                "key": "b",
                "text": "Interested in things that go together: for example, cup/saucer, puzzle parts."
              },
              {
                "key": "c",
                "text": "Realises that one object can act as a container for another: puts smaller objects inside bigger ones."
              },
              {
                "key": "d",
                "text": "Experiments: tries something and then reflects on it, and then tries something else: for example, if piece of puzzle doesn’t fit, tries it in the other holes."
              },
              {
                "key": "e",
                "text": "Intensely curious: exploring objects, rooms, outside areas or if not mobile shows curiosity by pointing or looking at areas/objects they would like to explore."
              },
              {
                "key": "f",
                "text": "Demonstrates persistent search for objects, even when hidden under two or three covers."
              },
              {
                "key": "g",
                "text": "Closely observes what animals, people and vehicles do."
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
                "text": "Experiments with different objects to look for other new properties: for example, plays with a plastic bowl by putting it on head, filling it with blocks, banging it, covering it with toys, looking through it, etc."
              },
              {
                "key": "b",
                "text": "Matches objects with parts that go together: for example, puts lid on saucepan."
              },
              {
                "key": "c",
                "text": "Enjoys playing with objects of different sizes that go together and shows an awareness of difference between big and little things: for example, hiding small objects inside larger ones."
              },
              {
                "key": "d",
                "text": "Shows understanding that things exist even when out of sight: for example, will refer to, request, or search for objects that are not currently in sight."
              },
              {
                "key": "e",
                "text": "Is curious and interested to explore new and familiar experiences in nature: grass, mud, puddles, plants, animal life."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Uses understanding of cause and effect: for example, straightens up a tower of blocks if it starts to wobble."
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
                "text": "Plays with playdough and other malleable materials making different shapes; will tell you what they have made."
              },
              {
                "key": "b",
                "text": "Enjoys simple stories about people and nature (birds, bees, snails, cats, dogs, etc.), and is interested in photographs of these."
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
                "text": "Matches sets of identical objects. Understands the idea of ‘the same’."
              },
              {
                "key": "b",
                "text": "Understands size differences: for example, selects the bigger or smaller object or picture when asked."
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
                "text": "Enjoys playing with small world reconstructions, drawing from first-hand experiences: for example, visits to farms, garages, train tracks; walking by river or lake; etc."
              },
              {
                "key": "b",
                "text": "Notices detailed features of objects in their environment."
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
                "text": "Can talk about some of the things they see or have observed such as plants, animals, natural and found objects."
              },
              {
                "key": "b",
                "text": "Shows care and concern for living things and the environment."
              },
              {
                "key": "c",
                "text": "Comments and asks questions about aspects of their familiar world, such as the place where they live or the natural world."
              },
              {
                "key": "d",
                "text": "Explore collections of materials with similar and/or different properties."
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
                "text": "Developing an understanding of growth, decay, and changes over time."
              },
              {
                "key": "b",
                "text": "Talks about why things happen and how things work."
              },
              {
                "key": "c",
                "text": "Talks about the differences between materials and changes they notice."
              },
              {
                "key": "d",
                "text": "Explores and talks about different forces they can feel: for example, how the water pushes up when they try to push a plastic boat under it."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Beginning to understand the effect of changing seasons on the natural world around them."
              },
              {
                "key": "b",
                "text": "Describes what they see, hear and feel whilst outside."
              },
              {
                "key": "c",
                "text": "Makes observations of animals and plants and explains why some things occur, and talks about changes."
              },
              {
                "key": "d",
                "text": "Talks about the features of their own immediate environment, features that they like and dislike, and how environments might vary from one another."
              },
              {
                "key": "e",
                "text": "Knows about similarities and differences in relation to places, objects, materials, and living things."
              },
              {
                "key": "f",
                "text": "Looks closely at similarities, differences, patterns, and change in nature."
              },
              {
                "key": "g",
                "text": "Draws information from a simple map."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "area": "Expressive Arts and Design",
    "strands": [
      {
        "name": "CREATING WITH MATERIALS",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": []
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Incidentally discovers mark-making: for example, notices that trailing a finger through spilt juice creates marks and patterns."
              },
              {
                "key": "b",
                "text": "Likes listening to music, rattles, and other sound-making toys."
              },
              {
                "key": "c",
                "text": "Enjoys (being engaged by an adult in) singing and action rhymes/games."
              },
              {
                "key": "d",
                "text": "Responds to music by swaying, bouncing, etc."
              },
              {
                "key": "e",
                "text": "Uses objects to make sounds: for example, bangs them together, hits with a hammer, shakes a rattle."
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
                "text": "Starts to make marks intentionally."
              },
              {
                "key": "b",
                "text": "Expresses emotion through the movement of fingers, hands, arms, and body."
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
                "text": "Holds pen or crayon using whole hand (palmar) grasp and scribbles with different strokes."
              },
              {
                "key": "b",
                "text": "Enjoys the sensory experience of making marks in food, damp sand, water, mud, paste, or paint."
              },
              {
                "key": "c",
                "text": "Begins to understand the cause and effect of their actions in mark making."
              },
              {
                "key": "d",
                "text": "Moves whole body to sounds they enjoy in music or to a regular beat."
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
                "text": "Scribbles spontaneously and makes strokes and dots on paper, enjoying the sensory feeling of making marks."
              },
              {
                "key": "b",
                "text": "Continues to explore and experiment with an increasing range of media and movement through multi-sensory exploration and expression: for example, exploring paint using fingers as well as brushes and other tools."
              },
              {
                "key": "c",
                "text": "Notices and becomes interested in the transformative effect of their action on materials and resources."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "When holding crayons, chalks, etc., makes connections between their movements and the marks they make: draws vertical lines; produces circular scribble; produces side-to-side and to-and–fro scribble."
              },
              {
                "key": "b",
                "text": "Is expressive through physical actions and sounds."
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
                "text": "Experiments with blocks, colours and marks."
              },
              {
                "key": "b",
                "text": "Incidentally discovers colour and how colours can be changed."
              },
              {
                "key": "c",
                "text": "Constructs by stacking solid wooden blocks vertically and horizontally, making enclosures and creating spaces."
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
                "text": "Express ideas and feelings through making marks, and sometimes give a meaning to the marks they make."
              },
              {
                "key": "b",
                "text": "Begins to name familiar colours."
              },
              {
                "key": "c",
                "text": "Has favourite materials, lights, music, and aromas."
              },
              {
                "key": "d",
                "text": "Builds simple structures using a variety of construction toys: for example, building a tower out of Duplo bricks."
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
                "text": "Draws with increasing complexity and detail, such as representing a face with a circle and including details, such as eyes, nose, and mouth."
              },
              {
                "key": "b",
                "text": "Shows an interest in the way musical instruments sound."
              },
              {
                "key": "c",
                "text": "Imitates movement in response to music."
              },
              {
                "key": "d",
                "text": "Experiments with ways to enclose a space, create shapes, and represent actions, sounds, and objects."
              },
              {
                "key": "e",
                "text": "Uses 3D and 2D structures to explore materials and/or to express ideas."
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
                "text": "Explores colour and colour mixing."
              },
              {
                "key": "b",
                "text": "Sings a few familiar songs."
              },
              {
                "key": "c",
                "text": "Develops an understanding of how to create and use sounds intentionally."
              },
              {
                "key": "d",
                "text": "Create closed shapes with continuous lines and begins to use these shapes to represent objects."
              },
              {
                "key": "e",
                "text": "Able to join a variety of construction materials in both horizontal and vertical directions."
              },
              {
                "key": "f",
                "text": "Explores different materials freely, in order to develop their ideas about how to use them and what to make."
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
                "text": "Chooses colour for a purpose."
              },
              {
                "key": "b",
                "text": "Develops preferences for forms of expression."
              },
              {
                "key": "c",
                "text": "Taps out simple repeated rhythms and makes some up."
              },
              {
                "key": "d",
                "text": "Uses various construction materials: for example, joining pieces, stacking vertically and horizontally, balancing, making enclosures, and creating spaces."
              },
              {
                "key": "e",
                "text": "Uses tools for a purpose."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Understands that different media can be combined to create new effects."
              },
              {
                "key": "b",
                "text": "Experiments to create different textures."
              },
              {
                "key": "c",
                "text": "Constructs with a purpose in mind, using a variety of resources."
              },
              {
                "key": "d",
                "text": "Recognises and explores how sounds can be changed, sings simple songs from memory, recognises repeated sounds and sound patterns, and matches movements to music."
              },
              {
                "key": "e",
                "text": "Explores the different sounds of instruments."
              },
              {
                "key": "f",
                "text": "Responds to comments and questions, talking about their creations."
              },
              {
                "key": "g",
                "text": "Uses simple tools and techniques competently and appropriately."
              },
              {
                "key": "h",
                "text": "Selects appropriate resources and adapts work where necessary."
              },
              {
                "key": "i",
                "text": "Returns to and builds on their previous learning, refining ideas, and developing their ability to represent them."
              },
              {
                "key": "j",
                "text": "Creates collaboratively, sharing ideas, resources, and skills."
              }
            ]
          }
        ]
      },
      {
        "name": "BEING IMAGINATIVE AND EXPRESSIVE",
        "steps": [
          {
            "number": 1,
            "ageRange": "0-3 months",
            "title": "Step 1 (0-3 months)",
            "items": []
          },
          {
            "number": 4,
            "ageRange": "6-10 months",
            "title": "Step 4 (6-10 months)",
            "items": [
              {
                "key": "a",
                "text": "Anticipates phrases and actions in rhymes and songs, such as ‘Peepo’."
              },
              {
                "key": "b",
                "text": "Anticipates actions, tickles, etc. from sounds and tunes of songs and rhymes: for example, giggles at the end of ‘Round and round the garden’, waiting for the tickle to come."
              },
              {
                "key": "c",
                "text": "Makes rhythmical and repetitive sounds."
              },
              {
                "key": "d",
                "text": "Copies actions they see performed that are already in their repertoire: for example, if they know how to bang their hands on the table they will copy another person doing this."
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
                "text": "Responds emotionally and physically to music when it changes."
              },
              {
                "key": "b",
                "text": "Expresses emotion through the movement of fingers, hands, arms, and body."
              },
              {
                "key": "c",
                "text": "Can copy using an object after seeing adult do it: for example, holds beater and bangs drum, etc."
              },
              {
                "key": "d",
                "text": "Can copy clapping hands."
              },
              {
                "key": "e",
                "text": "Can copy sounds or gestures that are not part of their repertoire: watches carefully then copies something they haven’t done before."
              },
              {
                "key": "f",
                "text": "Copies simple pretend play with familiar toys: for example, hugs and kisses teddy."
              },
              {
                "key": "g",
                "text": "Creates variations on familiar games: for example. ‘hides’ in different ways during peek-a-boo games and frequently tries out new ways of ‘hiding’."
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
                "text": "Moves and dances to music."
              },
              {
                "key": "b",
                "text": "Begins to join in with familiar songs and rhymes, making some sounds."
              },
              {
                "key": "c",
                "text": "Copies other’s use of objects, gesture or voice almost immediately."
              },
              {
                "key": "d",
                "text": "Imitates actions and activities of others as part of their play: for example, chatting on a phone."
              },
              {
                "key": "e",
                "text": "Accepts adult varying a game or pretend play and imitates and joins in with new actions and routines."
              },
              {
                "key": "f",
                "text": "Uses real object for pretend play: for example, drinks from a cup; brushes someone’s hair."
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
                "text": "Enjoys action games that involve standing, sitting, turning."
              },
              {
                "key": "b",
                "text": "Imitates adult activities and everyday routines: for example, sweeping, reading a book, fixing a bike, etc."
              },
              {
                "key": "c",
                "text": "Copies things they see and hear others doing around them: for example, phrases, parts of games, actions, etc."
              },
              {
                "key": "d",
                "text": "Collects items in a container to move around: for example, collects pebbles in a bucket or bricks in a shopping bag."
              },
              {
                "key": "e",
                "text": "Understands and follows stories read to them. Has favourite stories and characters."
              }
            ]
          },
          {
            "number": 8,
            "ageRange": "18-22 months",
            "title": "Step 8 (18-22 months)",
            "items": [
              {
                "key": "a",
                "text": "Joins in by singing, vocalising or moving whilst listening to music or playing with instruments/sound makers."
              },
              {
                "key": "b",
                "text": "Moves to music, listens to or joins in rhymes or songs."
              },
              {
                "key": "c",
                "text": "Repeats some pretend actions to more than one person: for example, gives parent/carer ‘tea’ to drink from an empty cup."
              },
              {
                "key": "d",
                "text": "Imitates everyday actions in pretend play: for example, brushing doll’s hair, making beds, tasting food, cleaning dolls house, getting in the car, shopping."
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
                "text": "Begins to build a repertoire of songs and dances."
              },
              {
                "key": "b",
                "text": "Enjoys and takes part in action songs, such as ‘Twinkle Little Star’."
              },
              {
                "key": "c",
                "text": "Pretends that one object represents another, especially when objects have characteristics in common"
              },
              {
                "key": "d",
                "text": "Spontaneously and independently makes a short pretend sequence: for example, pouring tea then drinking; washing and drying a doll; getting in a car and going to work."
              },
              {
                "key": "e",
                "text": "Enjoys dressing-up: for example, putting on hats or daddy’s shoes; dressing up as a favourite character."
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
                "text": "Creates sounds by rubbing, shaking, tapping, striking or blowing."
              },
              {
                "key": "b",
                "text": "Sings familiar songs: for example, pop songs, songs from TV programmes, rhymes, songs from home."
              },
              {
                "key": "c",
                "text": "Begins to make-believe by pretending."
              },
              {
                "key": "d",
                "text": "Plays dressing-up games."
              },
              {
                "key": "e",
                "text": "Uses other people’s belongings in pretend play: for example: Mum’s bag and brush."
              },
              {
                "key": "f",
                "text": "Creates imaginary objects, characters and scenes in play: for example, talks to an imaginary shopper as if they are the shop assistant."
              },
              {
                "key": "g",
                "text": "Adopts voice or manner of another person or animal in play: for example, moves like a cat and ‘miaows’."
              },
              {
                "key": "h",
                "text": "Imitates an adult pouring tea, putting in milk and sugar, stirring and then giving to doll."
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
                "text": "Recalls and sings entire songs."
              },
              {
                "key": "b",
                "text": "Engages in imaginative play based on own ideas or first-hand or peer experiences: for example, uses props to create different characters, such as a tool belt to become a builder."
              },
              {
                "key": "c",
                "text": "Uses doll, teddy, etc. as partner in play; talking to it and telling it what to do next."
              },
              {
                "key": "d",
                "text": "Takes part in simple pretend play, using an object to represent something else even though they are not similar: for example, uses a blanket to represent a river."
              },
              {
                "key": "e",
                "text": "Begins to make believe by pretending using sounds, movements, words, and objects. Begins to describe sounds and music imaginatively: for example, ‘scary music’."
              },
              {
                "key": "f",
                "text": "Uses construction materials as a means to an end: for example, making a road or house to be used as part of a game rather than as something simply to be explored."
              },
              {
                "key": "g",
                "text": "Uses everyday materials to explore, understand, and represent their world: their ideas, interests, and fascinations."
              },
              {
                "key": "h",
                "text": "Makes simple models which express their ideas."
              },
              {
                "key": "i",
                "text": "Begins to develop complex stories using small world equipment, such as animal sets, dolls and dolls houses, etc."
              }
            ]
          },
          {
            "number": 12,
            "ageRange": "35 – 41 months",
            "title": "Step 12 (35 – 41 months)",
            "items": [
              {
                "key": "a",
                "text": "Experiments and creates movement in response to music, stories, and ideas."
              },
              {
                "key": "b",
                "text": "Sings and makes up simple songs."
              },
              {
                "key": "c",
                "text": "Can put sequences of movements together: for example, to create a simple dance routine."
              },
              {
                "key": "d",
                "text": "Uses drawing to represent ideas like movement or loud noises."
              },
              {
                "key": "e",
                "text": "Notices what other children and adults do, mirroring what is observed, adding variations, and then doing it spontaneously."
              },
              {
                "key": "f",
                "text": "Responds imaginatively to art works and objects: for example, ‘this music sounds likes dinosaurs’; ‘that sculpture is squishy like this [child physically demonstrates]’; ‘that peg looks like a mouth’."
              },
              {
                "key": "g",
                "text": "Makes imaginative and complex ‘small worlds’ with blocks and construction kits, such as a city with different buildings and a park."
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
                "text": "Creates their own songs, or improvises a song around one they know."
              },
              {
                "key": "b",
                "text": "Sings the melodic shape of familiar songs."
              },
              {
                "key": "c",
                "text": "Sings the pitch of a tone sung by another person (‘pitch match’)."
              },
              {
                "key": "d",
                "text": "Taps out simple repeated rhythms."
              },
              {
                "key": "e",
                "text": "Creates representations of both imaginary and real-life ideas, events, people, and objects."
              },
              {
                "key": "f",
                "text": "Continues to explore moving in a range of ways: for example, mirroring, creating own movement patterns."
              },
              {
                "key": "g",
                "text": "Creates sounds, movements, or drawings to accompany stories and ideas."
              },
              {
                "key": "h",
                "text": "Uses movement and sounds to express experiences, expertise, ideas, and feelings."
              },
              {
                "key": "i",
                "text": "Plays instruments with increasing control to express their feelings and ideas."
              },
              {
                "key": "j",
                "text": "Shows different emotions in their drawings and paintings, such as happiness, sadness, fear, etc."
              },
              {
                "key": "k",
                "text": "Uses available resources to create props, or creates imaginary ones to support play."
              }
            ]
          },
          {
            "number": 14,
            "ageRange": "50-60 months+",
            "title": "Step 14 (50-60 months+)",
            "items": [
              {
                "key": "a",
                "text": "Explores and engages in music making and dance, performing solo or in groups."
              },
              {
                "key": "b",
                "text": "Sings in a group or on their own, increasingly matching the pitch and following the melody."
              }
            ]
          }
        ]
      }
    ]
  }
] as const;

export const STATUS_OPTIONS = [
  { value: "emerging", label: "Emerging" },
  { value: "developing", label: "Developing" },
  { value: "secure", label: "Secure" },
] as const;
