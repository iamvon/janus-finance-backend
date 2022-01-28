require('dotenv').config();
const axios = require('axios')
const SolanaMetaModel = require('../models/solanaMeta.model')
const db = require('../database');
const {
    MONGODB_USER, 
    MONGODB_PASS, 
    MONGODB_IP, 
    MONGODB_PORT, 
    MONGODB_DATABASE, 
    PORT, 
    PROJECT_NAME,
    API_PREFIX
} = process.env

console.log(`mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`)

const handleGetToken = async () => {
    console.log("Start fetching solana metadata")
    try {
        const {status, data} = await axios.get('https://solana.com/_next/data/fwilZeE-MEIdzWAVPXj6t/en/ecosystem.json')
        if (status === 200) {
            const projects = data.pageProps.projects
            const projectSlugs = projects.map(project => project.frontmatter.slug)
            const urls = projectSlugs.map(slug => `https://solana.com/_next/data/fwilZeE-MEIdzWAVPXj6t/en/ecosystem/${slug}.json`)
            Promise.all(urls.slice(0, 200).map(url => {
                return axios.get(encodeURI(url))
            })).then(results => {
                results.forEach((result, index) => {
                    const {data, status} = result
                    const meta = data?.pageProps?.project
                    if (meta) {
                        const {content, frontmatter} = meta
                        const formattedContent = content.replace(/(\r\n|\n|\r)/gm, "");
                        const {slug, title, logline, cta, category, website, twitter, telegram, discord, logo} = frontmatter
                        const metaDataBySlug = {slug, title, logline, cta, category, website, twitter, telegram, discord, logo, content: formattedContent}
                        SolanaMetaModel.findOneAndUpdate({slug: metaDataBySlug.slug}, {
                            ...metaDataBySlug
                        }, { upsert: true, new: true }, (err, doc, raw) => {
                            if(err) console.log(err)
                            if(index % 100 === 0) console.log(index)
                            if(index === results.length - 1) console.log("Total solana meta inserted: ", index + 1)
                        })
                    }
                })
            }).catch(err => {
                console.log(err);
            })
        } else {
            console.log('Maybe fetch catch error some where')
        }
    } catch (error) {
        console.log(error)
    }
}
const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    const res = await db.connect(urlConnection)
    
}

const recursiveFunc = async () => {
    console.log("Task is running every 10 minutes " + new Date())
    await dbConnect()
    await handleGetToken()
    await new Promise(res => setTimeout(res, 1000*60*10))
    await db.close()
    recursiveFunc()
}
    
recursiveFunc()    