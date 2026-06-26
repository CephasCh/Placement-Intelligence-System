This is a Pre-requiste file for the project. This is a step by step guide to set up the required database and other connections before developing the main application.

There is a folder in the github that contains all the data and the scripts to be run in the Supabase to setup the main databse

First we need a Supabase account 

* Open your Supabase account and then in your organisation create a new project and name it 'staging_companies' and make sure RLS is disabled in your project (Disabling RLS is really important)

* Go to your project, and open SQL editor on the left panel and copy paste the script found in the folder "1.Create the staging table using the Script". This will create your table

* Then go to your table in the table editor here you can see a new table, open it and click insert data. Insert data using CSV, the required CSV file is found in the folder "2.Data Ingestion into the staging table with 116 companies", make sure the RLS is disabled

* After successfully uploading the data run the script found inside the folder "3. Create the 90 tables using the Script", to create 90 tables that are normalized. This action creates the tables and next few steps we will insert the data. Run the script in the SQL editor

* Then you will be able to find two csv files in the folder "4. Load the Countries and Cities Master data from the CSV", It is important that you load the countries data first by opening the countries table in the table editor and insert data using CSV.

* Repeat the same for the cities table, It is important you load the countries table first

* Then open SQL editor again and run the script found inside the folder "5. Execute the Script to migrate data into the 88 tables with triggers", run the script twice to successfully load the data into all the remaing tables. This script triggers a function that loads the normalized data from the first table.

* After normalizing the data check if the tables are populated, if not done check if you missed any of the above steps and complete them.

* If the data is normalized then open the SQL editor and run the script found inside the folder "6. Run the Skills and Proficiency DB script"

* The above script should create two tables: 'staging_skills_topics' & 'staging_company_skill_levels'

* In the next folder "7. Data Ingestion into staging_skills_topic and staging_company_skill_levels" you will find a folder each for two tables that has the csv data for each. Insert your data into the tables from the table editor and make sure you put the right data in the right table.

* After completing the above step run the script from the folder "8. View Generation", this will generate the necessary views that are required for the application. 

This Phase should complete your Supabase data setup. All the data that you require for the project is ready.

To build the actual platform locally we need 2 more important things. Login to ChatGPT with an account and make sure you use the same account for both ChatGPT and Codex. Go to the apps section in the left panel of the ChatGPT in the website, search for Supabase and connect your Supabase account to the ChatGPT. This will further help us when we are working in the Codex.

Now if you wanna build the application I have provided the Master prompts for the system design and the UI design. These are greatly detailed prompts and work as a base layer in the application development. You can add your required styling in the end as you like to develop the UI to your liking. The prompts build the base app and then you can customize the UI using codex. 

Open your Codex desktop app and login to the same account as your ChatGPT, this should let codex access the Supabase data too. Your Supabase and Codex are now communicating with eachother, try asking codex what do you see in my 'staging_companies' project of my supabase. It should be able to tell you about your data. This confirms that Supabase and Codex are connected.

Second Important step is for you to install Ollama to your desktop, and have the Ollama gemma 3:4b model. This is part of the locally deployed Chatbot that we are using for the platform.

This is an optional step, you can have it or not. Be sure that you specify codex to ignore the Chatbot page or not develop it when you pass in the master prompt and the design prompts. You can install ollama application and then run 'ollama pull gemma3:4b' in your terminal to install the required model. 


