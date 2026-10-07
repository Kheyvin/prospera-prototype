## Your Goal

To write a detailed spec.md that have all the information  in  "The `spec.md` — Table of Contents" section (you are the owner of this task so if you think that you can do a better document with other content, you have my permission to create a different version, the goal is one: to get the best specification that an ai agent coding can read and implement), to construct a prototype that will be shared as a single and portable HTML archive to a specific client using his internal organizational information, providing the architecture of the entire project once we built it and the methodologies we will use. we will offer a delimited scope and the prototype only contains a certain amount of data and a simulation of how the finished solution will look like.

The spec most be complete, with all the data, messages, etc. that the prototype will show in every part.  Before write the spec you must read [[ux]]  to decide about how to show the information in a proper way and user friendly. You also must refer [[design]] to have an standarized way to show everything and, of course, you will refer [[arch]]  to let know to the AI Agent coding that build the prototype using the spec you will create that we already validate good practices. If you see something that doesnt make sense to you, you can update it but only if it is really needed.

Remember: You don't create the prototype, just the spec

## The long term vision of the finished product
[[prtProspera/prototype-prospera/VISION]] as you see is more than the scope defined with the client, but it's a good starter point to understand our ambition.


## The Functional Organization of the Prototype, what the HTML will show and how 

### Tab 1: Architecture of the Solution

This view contains the architecture of the solution once we build it.
 for this case we will use only a light proposal of the system using a c4 diagram on level 2  (Containers) and complementing with icons and proper colors so the user can understand what is every part of the system.

The web will be hosted in a VPS, all the organizational data will be stored in a graph database (Neo4j) in the VPS and the desktop application is portable so any user with correct permision (user and password setted on the web) using the desktop app can use it. And to the web, any colaborator can enter to see only the information that his job position allowed to access (all roll positions on the graph database will be somehow connected with the "security" database that bring all the access and logs)

there will be on the web three kind of users (roles):
admin: has permission for all
manager: has permission for all the information of the organization as viewer
employee: has permission for all the information that his job position permit

 Use non technical language to explain concepts 
### Tab 2: Scope of the Project
Remember that the prototype we are building is supposed to implement an entire software project once the prototype is approved.
All the scope is in [[propuesta-prospera]] and [[email-scope-response]]
### Tab 3: Methodologies Supported
All the methodologies we MAY use are in [[email-scope-response]] but you must go deep in every functionality understand every use case an then and only then generate this sumary of all the methdologies we will use, beacuse here we explain where and how we  uses each one. In non technical language.

### Tab 4: Web-Module Prototype
Here we implement the real prototype of the web view looking for [[arch]] and [[ux]] and obtaining all the functional information from [[propuesta-prospera]] and [[email-scope-response]] and all the data from the organization from  /home/chalreme/Proyectos/Training/prtProspera/prototype-prospera/client-inputs/prospera/internal-information/Organigrama Septiembre 2026.png (Organigram), and the especific case of the process emision-boletas here /home/chalreme/Proyectos/Training/prtProspera/prototype-prospera/client-inputs/prospera/internal-information/Caso-emision-boletas (read all the content of the folder)
### Tab 5: Desktop-Module Prototype
Here we prototype the desktop app using all the information 


Below is a **table of contents for `spec.md`**, not the specification itself. It is shaped for an AI coding agent building a clickable HTML prototype, with clear behavior, visual guidance, and acceptance criteria. It also keeps the prototype’s scope separate from any future production architecture.

##  The `spec.md` — Table of Contents
(I will put with <comment>my comments</comment> )

## 1. Document Control

- Purpose of this specification
- Product or prototype name
- Version, date, and owner
- Status: draft, approved, or superseded
- Change history
- Related files and source materials

## 2. Instructions for the AI Builder

- What the AI is expected to deliver
- Which sources are authoritative if instructions conflict
- What the AI must not invent or assume
- How to handle missing or contradictory requirements
- When to ask a question versus record an assumption
- Required implementation and response format

## 3. Product Summary

- One-paragraph product description
- The problem the prototype demonstrates
- Intended audience
- The main idea a viewer should understand
- What the prototype is meant to prove or help evaluate

## 4. Goals and Success Criteria

- User goals
- Business goals
- Prototype goals
- Measurable signs that the prototype succeeds
- What is explicitly outside the goals

## 5. Users, Roles, and Permissions

- User personas and their needs
- Roles represented in the prototype
- What each role can see or do
- Permission differences between roles
- Any simplified permission behavior used for the demo

## 6. Scope and Boundaries

- Features included in this prototype
- Features intentionally excluded
- What is simulated with sample data
- What requires a real backend in a future version
- Assumptions and known limitations

## 7. Reference Materials

- Attached examples or existing prototypes
- What to preserve from each reference
- What to change or replace
- Which parts are visual inspiration versus functional requirements
- Screenshots, links, or sample content the AI should use

## 8. Information Architecture and Navigation

- Site map or screen hierarchy
- Main navigation and secondary navigation
- How users move between levels of information
- Breadcrumb, back, and home behavior
- Deep links or direct-entry behavior, if needed

## 9. Domain Concepts and Data Relationships

- Key terms and definitions
- Main entities and their attributes
- Relationships between entities
- Required identifiers and status values
- How the concepts appear in the interface

For an organization or process prototype, specify the hierarchy explicitly—for example, **organization → area → macroprocess → process → activity → role → person → work**—and identify which levels are clickable.

## 10. Screen and Component Specifications

Create a subsection for every screen or major view:

- Screen name and purpose
- User roles that can access it
- Layout regions
- Data shown
- Available actions
- Navigation destinations
- Empty, loading, error, and restricted states

Also describe shared components such as sidebars, cards, tables, search, filters, modals, and status indicators.

## 11. User Journeys and Interaction Flows

For each important journey, specify:

- Starting point
- User action
- System response
- Resulting screen or state
- Alternate paths
- Error or cancellation behavior

Include the key end-to-end paths the prototype must support, rather than only listing individual screens.

## 12. Functional Requirements

Give each requirement a stable ID, such as `FR-001`.

For every requirement, define:

- Description
- User or role affected
- Trigger or precondition
- Expected behavior
- Result
- Acceptance criteria
- Priority: must, should, or could

## 13. Visual and Content Direction

- Desired visual style and mood
- Brand colors, typography, spacing, and icon guidance
- Content hierarchy and density
- Naming conventions and tone
- Sample content requirements
- Text that must appear exactly as provided
- Guidance for charts, diagrams, and status colors

## 14. Interaction and State Rules

- Click, hover, focus, and keyboard behavior
- Search, filtering, sorting, and selection behavior
- Modal, drawer, and confirmation behavior
- How state changes are represented
- Whether changes persist during the session
- How reset or refresh behavior should work

## 15. Responsive Design and Accessibility

- Supported viewport sizes
- Desktop, tablet, and mobile layout behavior
- Keyboard navigation expectations
- Focus visibility
- Color contrast and non-color status cues
- Screen-reader labels for important controls
- Reduced-motion behavior, if applicable

## 16. Sample Data and Demo Behavior

- Required sample records
- Relationships between sample records
- Data that must remain consistent across screens
- Which actions change sample state
- Whether changes reset on reload
- How to make the demo understandable without explaining it verbally

## 17. Technology and Implementation Constraints

- Required language and framework
- Build tool and project structure
- Browser support
- Dependency and asset constraints
- Coding conventions
- Architecture boundaries appropriate for the prototype
- Any implementation choices the AI should avoid

If the chosen approach is TypeScript, React, and Vite, state that here and define how the source is organized. Keep this section focused on building the prototype; describe production systems separately.

## 18. Standalone HTML and Delivery Requirements

- Required output files
- How to build the prototype
- Required location of the final HTML file
- Whether CSS, JavaScript, fonts, and images must be embedded
- Whether the file must work offline
- Whether external services or network requests are forbidden
- How to verify the HTML opens and functions when shared

## 19. Quality Requirements

- Usability expectations
- Performance expectations
- Reliability expectations
- Security and privacy expectations for demo data
- Maintainability expectations for the source project
- Any quality trade-offs acceptable for the prototype
