# Fact Check Notes

Date: 2026-04-24

Scope: first and second pass for the 12 static pet tools. These tools are still informational and should not make diagnosis, treatment, dosage, or disease-prevention claims.

## Second Pass Summary

Second-pass priority was authoritative-source verification. Sources were upgraded or rechecked against Merck Veterinary Manual, WSAVA, AAHA/AAFP, CAPC, ASPCA, USDA APHIS, Cornell Feline Health Center, Tufts Petfoodology, VCA, and UC Davis.

Code changes from this pass:

- Daily food calculator source note changed from a vague "30%" variation to a broader WSAVA-supported "starting point; individual needs vary widely" statement.
- Meal frequency was adjusted:
  - Kittens under 6 months: 3 meals/day.
  - Kittens 6-12 months: 2 meals/day.
  - Puppies under 3 months: 4 meals/day.
  - Puppies 3-6 months: 3 meals/day.
  - Puppies over 6 months: 2 meals/day.
- Deworming reminder default changed from a loose 12-week interval to CAPC-aligned reminder types:
  - Monthly broad-spectrum reminder.
  - Young puppy/kitten 2-week reminder.
  - Custom vet interval.

## Source Decisions

1. Daily food calculator
   - Status: usable as an estimate.
   - Formula: `RER = 70 x body weight(kg)^0.75`; `MER = RER x factor`.
   - Factors used from Merck Veterinary Manual:
     - Adult dog intact: `1.8 x RER`
     - Adult dog neutered: `1.6 x RER`
     - Adult dog obesity prone: `1.4 x RER`
     - Puppy under 4 months: `3.0 x RER`
     - Puppy over 4 months: `2.0 x RER`
     - Adult cat intact: `1.4 x RER`
     - Adult cat neutered: `1.2 x RER`
     - Adult cat obesity prone: `1.0 x RER`
     - Kitten: `2.5 x RER`
   - Boundary: calories are only a starting point and may vary by individual response.
   - Unit note: US mode uses `kcal/cup`; metric mode uses `kcal/100g`. These are not automatically converted because kibble density varies by product.
   - Second pass: WSAVA FAQ/Myths supports that calorie estimates are starting points and individual dogs/cats can vary substantially.

2. Calorie needs
   - Status: usable as an estimate using the same RER/MER source as tool 1.

3. Treat budget
   - Status: usable as a planning estimate.
   - Rule: treats should not exceed about 10% of daily calorie intake.
   - Boundary: treats are not complete and balanced food.

4. Water intake
   - Status: usable as a broad normal-range prompt.
   - Formula: `44-66 mL/kg/day`.
   - Boundary: wet food, heat, exercise, fever, disease, pregnancy/lactation, and medications can change needs.

5. Body condition
   - Status: changed from target-weight calculator to BCS interpreter.
   - Reason: the previous goal-weight estimate was not sufficiently source-backed.
   - Source: 9-point BCS scale; ideal dog range is 4-5/9, ideal cat score is 5/9.

6. Pet age converter
   - Status: keep as rough education, not health scoring.
   - Boundary: dog size and breed matter; UC Davis notes that one epigenetic formula was based on Labradors and may not generalize to all breeds.

7. Meal frequency
   - Status: keep as a puppy/kitten planning prompt only.
   - Boundary: exact frequency depends on breed, size, food, schedule, and veterinary advice.
   - UI change: removed adult dog/cat option.
   - Second pass: adjusted kitten frequency to Cornell Feline Health Center. Puppy frequency remains a conservative prompt supported by VCA/Tufts guidance, not a universal rule.

8. Vaccine timeline
   - Status: checklist only.
   - Boundary: do not generate a self-administered schedule. Local law, prior records, lifestyle, and veterinarian risk assessment matter.

9. Deworming planner
   - Status: reminder-only.
   - Boundary: do not provide medication dose or product selection.
   - Second pass: default reminder logic changed to CAPC-aligned options; 2-week reminders only appear as a young puppy/kitten reminder type.

10. Travel checklist
   - Status: checklist-only.
   - Boundary: international travel requirements and airline requirements change; destination must be checked each trip.

11. Annual budget
   - Status: arithmetic-only user-input planner.
   - Boundary: no medical or price claims.

12. Food safety lookup
   - Status: limited lookup table.
   - Boundary: unknown foods should direct users to a veterinary poison-control source.

## Sources

- Merck Veterinary Manual: Nutritional Requirements of Small Animals
  https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-of-small-animals
- Merck Veterinary Manual: Daily Maintenance Energy Requirements for Dogs and Cats
  https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats
- Merck Veterinary Manual: Maintenance Fluid Plan in Animals
  https://www.merckvetmanual.com/therapeutics/fluid-therapy/maintenance-fluid-plan-in-animals
- Merck Veterinary Manual: Body Condition Score Scales for Dogs and Cats
  https://www.merckvetmanual.com/multimedia/table/body-condition-score-scales-for-dogs-and-cats
- WSAVA Global Nutrition Guidelines
  https://wsava.org/global-guidelines/global-nutrition-guidelines/
- WSAVA FAQ and Myths
  https://wsava.org/wp-content/uploads/2020/01/Frequently-Asked-Questions-and-Myths.pdf
- WSAVA Nutritional Assessment Checklist
  https://wsava.org/wp-content/uploads/2020/01/Nutritional-Assessment-Checklist.pdf
- AAHA 2022 Canine Vaccination Guidelines
  https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/
- AAHA/AAFP 2020 Feline Vaccination Guidelines
  https://www.aaha.org/resources/2020-aahaaafp-feline-vaccination-guidelines/
- CAPC General Guidelines
  https://capcvet.org/guidelines/general-guidelines/
- CAPC Ascarid Guidelines
  https://capcvet.org/guidelines/ascarid/
- ASPCA People Foods to Avoid Feeding Your Pets
  https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets
- USDA APHIS Pet Travel Process Overview
  https://www.aphis.usda.gov/pet-travel/pet-travel-process-overview
- UC Davis School of Veterinary Medicine: Calculating Your Dog's Age
  https://healthtopics.vetmed.ucdavis.edu/health-topics/canine/calculating-your-dogs-age
- VCA Animal Hospitals: Treat calorie limit
  https://vcahospitals.com/resources/preventive-cat/nutrition/true-or-false-pet-treats-should-make-up-10-percent-of-your-pet-s-daily-calories
- Cornell Feline Health Center: Cat feeding frequency
  https://www.vet.cornell.edu/departments/cornell-feline-health-center/health-information/feline-health-topics/how-often-should-you-feed-your-cat
- Tufts Petfoodology: Feeding frequency
  https://sites.tufts.edu/petfoodology/2021/02/08/how-often-should-you-feed-my-pet/
- VCA Animal Hospitals: Puppy feeding frequency
  https://vcacanada.com/sitecore/content/vca/home/know-your-pet/puppy---recommendations-for-new-owners-part-ii---general-care
- Purina Institute: Feeding kittens
  https://www.purinainstitute.com/centresquare/life-stage-nutrition/feeding-kittens
